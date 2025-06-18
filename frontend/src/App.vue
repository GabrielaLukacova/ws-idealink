<template>
  <div class="container">

    <router-view />

    <footer class="sticky-footer">
      <p>© 2025 IdeaLink</p>
    </footer>
  </div>
</template>

<script setup>
</script>

<style scoped>
.sticky-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  /* background: #5d4037; */
  /* color: rgba(255, 255, 255, 0.75); */
  /* color: #acac92; */
  text-align: center;
  padding: 0.8rem;
  font-size: 0.9rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}</style>

