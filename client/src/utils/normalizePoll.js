export const normalizePoll = (p) => ({
  id: p.id,
  title: p.title,
  description: p.description,
  image: p.image_link || null,
  totalVotes: Number(p.total_votes ?? 0),
  options: p.options || [],
  timeLeft: p.timeLeft,
  expiresAt: p.expires_at,
  username: p.username,
  userId: p.created_by,
  hasVoted: p.has_voted ?? false
});