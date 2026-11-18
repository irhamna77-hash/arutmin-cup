export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM matches ORDER BY id ASC"
    ).all();

    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { id, match_date, match_time, home_score, away_score, status, pin } = body;

    if (pin !== "2026") {
      return new Response(JSON.stringify({ error: "PIN Admin salah" }), { status: 401 });
    }

    await env.DB.prepare(`
      UPDATE matches 
      SET home_score = ?, 
          away_score = ?, 
          status = ?,
          match_date = COALESCE(?, match_date),
          match_time = COALESCE(?, match_time)
      WHERE id = ?
    `).bind(
      home_score ?? null,
      away_score ?? null,
      status || "upcoming",
      match_date || null,
      match_time || null,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, id }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
