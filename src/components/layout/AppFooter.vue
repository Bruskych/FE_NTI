<template>
  <footer class="footer">
    <div class="container">
      <p>&copy; 2026 Národná technologická iniciatíva. Všetky práva vyhradené.</p>
      <div class="links">
        <a href="#">Kontakt</a>
        <a href="#">Ochrana údajov</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: 100%;
  background: #f8fafc;
  padding: 2rem 0;
  margin-top: auto;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.9rem;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}
.links {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}
.links a { color: #64748b; text-decoration: none; }
</style>