export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM matches ORDER BY id ASC"
    ).all();
    
    return new Response(JSON.stringify(results), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const data = await request.json();
    const { id, home_score, away_score, status, pin } = data;

    if (pin !== "2026") {
      return new Response(JSON.stringify({ error: "PIN Admin tidak valid!" }), { status: 403 });
    }

    await env.DB.prepare(
      "UPDATE matches SET home_score = ?, away_score = ?, status = ? WHERE id = ?"
    ).bind(
      home_score === "" || home_score === null ? null : parseInt(home_score),
      away_score === "" || away_score === null ? null : parseInt(away_score),
      status,
      id
    ).run();

    return new Response(JSON.stringify({ success: true, message: "Skor berhasil diperbarui!" }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
