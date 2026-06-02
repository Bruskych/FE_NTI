<!--
  Нижняя панель сайта
-->

<script setup lang="ts">

</script>

<template>
  <footer class="footer">
    <div class="container">

      <p class="copyright">{{ $t('footer.license') }}</p>

      <div class="links">
        <a href="#">{{ $t('footer.contacts') }}</a>
        <a href="#">{{ $t('footer.privacy_policy') }}</a>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.footer {
  padding: 12px 0;
  font-size: 0.85rem;
  width: 100%;
  background: var(--menu-color);
  margin-top: auto;
  border-top: 1px solid var(--menu-border);
  color: #64748b;
}
.container {
  margin: 0 auto;
  padding: 0 40px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}
.links {
  display: flex;
  gap: 1rem;
}
.links a {
  color: #64748b;
  text-decoration: none;
}
</style>