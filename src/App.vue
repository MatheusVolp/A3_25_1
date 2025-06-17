<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Roboto');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Roboto', Arial, sans-serif;
}

body {
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  color: #f0f0f0;
  cursor: url('/images/gam1555.png') 8 8, auto;
}

html,
body {
  width: 100%;
  height: 100%;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
  appearance: none;
}

h1,
h2 {
  color: #f0f0f0;
}
</style>