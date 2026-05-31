"""
RL Ranker — Epsilon-greedy bullet ranker.
Loads per-user bullet scores from Supabase and updates them on feedback.
Scores persist across sessions.
"""
import random
import hashlib
from database.supabase_client import supabase


REWARD_MAP = {
    "kept": 1.0,
    "edited": 0.3,
    "deleted": 0.0,
    "downloaded": 0.5,
}


class BulletRanker:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.scores: dict[str, float] = {}
        self._load_scores_from_db()

    def _bullet_hash(self, bullet_text: str) -> str:
        return hashlib.md5(bullet_text.encode()).hexdigest()

    def _load_scores_from_db(self):
        """Load existing bullet scores from rl_feedback table for this user."""
        try:
            rows = (
                supabase.table("rl_feedback")
                .select("bullet_hash, score_after")
                .eq("user_id", self.user_id)
                .not_.is_("score_after", "null")
                .execute()
            )
            for row in rows.data:
                h = row["bullet_hash"]
                score = row["score_after"]
                if h not in self.scores:
                    self.scores[h] = score
                else:
                    # Average if multiple feedback entries exist
                    self.scores[h] = (self.scores[h] + score) / 2
        except Exception:
            pass  # DB load failure is non-fatal; start with empty scores

    def rank(self, bullets: list[str], epsilon: float = 0.15) -> list[str]:
        """
        Rank bullets using epsilon-greedy strategy.
        With probability epsilon: explore (random shuffle).
        Otherwise: exploit (sort by learned score, high-first).
        """
        if not bullets:
            return bullets
        if random.random() < epsilon:
            shuffled = bullets.copy()
            random.shuffle(shuffled)
            return shuffled
        return sorted(
            bullets,
            key=lambda b: self.scores.get(self._bullet_hash(b), 0.5),
            reverse=True,
        )

    def get_score(self, bullet_text: str) -> float:
        return self.scores.get(self._bullet_hash(bullet_text), 0.5)

    async def update(
        self,
        resume_id: str,
        bullet_text: str,
        section: str,
        user_action: str,
    ):
        """
        Update bullet score using exponential moving average.
        Persists the new score to Supabase rl_feedback table.
        """
        import asyncio
        reward = REWARD_MAP.get(user_action, 0.0)
        h = self._bullet_hash(bullet_text)
        old_score = self.scores.get(h, 0.5)
        # Exponential moving average update
        new_score = old_score + 0.1 * (reward - old_score)
        self.scores[h] = new_score

        def _insert():
            supabase.table("rl_feedback").insert({
                "resume_id": resume_id,
                "user_id": self.user_id,
                "bullet_text": bullet_text,
                "bullet_hash": h,
                "section": section,
                "score_before": old_score,
                "score_after": new_score,
                "user_action": user_action,
                "reward": reward,
            }).execute()

        try:
            await asyncio.to_thread(_insert)
        except Exception:
            pass  # Non-fatal — scores are updated in memory regardless

