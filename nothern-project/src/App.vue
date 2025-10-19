<template>
  <header>
    <span>NothernFox</span>
    <ul>
      <li><router-link to="/login">Авторизация</router-link></li>
      <li><router-link to="/categories">Категория</router-link></li>
      <li><router-link to="/items">Товары не по категориям</router-link></li>
    </ul>
  </header>
  <router-view></router-view>
</template>

