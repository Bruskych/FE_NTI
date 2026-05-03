<template>
  <div class="home">
    <section class="hero">
      <h1>Vitajte na portáli NTI</h1>
      <p>Podpora inovácií и technologického rozvoja na Slovensku.</p>
      <div class="cta">
        <router-link to="/programs" class="btn-main">Prezrieť programy</router-link>
      </div>
    </section>

    <section class="info">
      <div class="card">
        <h3>Program A</h3>
        <p>Podpora pre študentov и mladých inovátorov.</p>
      </div>
      <div class="card">
        <h3>Program B</h3>
        <p>Spolupráca s firmami и priemyslom.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 4rem 1rem;
  background: linear-gradient(to bottom, #eff6ff, #ffffff);
}
.hero h1 { font-size: 2.5rem; color: #1e293b; margin-bottom: 1rem; }
.hero p { font-size: 1.2rem; color: #64748b; margin-bottom: 2rem; }
.btn-main {
  background: #2563eb;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0.6rem;
  text-decoration: none;
  font-weight: bold;
}
.info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
}
.card {
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  transition: transform 0.2s;
}
.card:hover { transform: translateY(-5px); }
</style>