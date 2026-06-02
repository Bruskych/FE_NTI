<script setup>
// Тут буде ваш код скрипта
</script>

<template>
  <header>
    <div class="wrapper">
      <h1>Проект успішно запущено!</h1>
    </div>
  </header>

  <main>
  </main>
</template>

<style scoped>
header {
  line-height: 1.55;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: 1rem;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>