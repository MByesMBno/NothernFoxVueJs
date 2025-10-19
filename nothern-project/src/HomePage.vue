<template>
  <div class="min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
    <!-- Hero Section -->
    <section class="relative py-20 px-4 overflow-hidden">
      <div class="max-w-7xl mx-auto text-center relative z-10">
        <h1 class="text-5xl md:text-6xl font-bold text-blue-900 mb-6">
          Северный лис
        </h1>
        <p class="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
          Уникальные handmade изделия с душой. Аромасвечи, керамика и декор для вашего уюта
        </p>
        <div class="flex justify-center gap-4 flex-wrap mb-12">
          <Button
            class="bg-blue-900 hover:bg-blue-800 border-none text-white font-semibold px-8 py-3 text-lg"
            @click="$router.push('/items')"
          >
            <i class="pi pi-shopping-bag mr-2"></i>
            В каталог
          </Button>
          <Button
            class="bg-amber-500 hover:bg-amber-400 border-none text-gray-900 font-semibold px-8 py-3 text-lg"
            @click="scrollToCategories"
          >
            <i class="pi pi-star mr-2"></i>
            Смотреть коллекции
          </Button>
        </div>

        <!-- Featured Products Preview -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div v-for="product in featuredProducts" :key="product.id"
               class="bg-white rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300">
            <div class="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i :class="product.icon" class="text-amber-700 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-blue-900 mb-2">{{ product.title }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>
            <span class="text-amber-600 font-bold">{{ product.price }}</span>
          </div>
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="absolute top-10 left-10 w-20 h-20 bg-amber-200 rounded-full opacity-20"></div>
      <div class="absolute bottom-10 right-10 w-32 h-32 bg-blue-200 rounded-full opacity-20"></div>
    </section>

    <!-- About Section -->
    <section class="py-20 px-4 bg-white bg-opacity-50">
      <div class="max-w-6xl mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 class="text-4xl font-bold text-blue-900 mb-6">О мастере</h2>
            <p class="text-lg text-gray-700 mb-6 leading-relaxed">
              Добро пожаловать в мир "Северного лиса"! Я создаю уникальные handmade изделия,
              вкладывая в каждое частичку души и тепла северной природы.
            </p>
            <p class="text-lg text-gray-700 mb-8 leading-relaxed">
              Все изделия сделаны вручную из натуральных материалов с любовью к деталям.
              От аромасвечей до керамики - каждая вещь неповторима и создана для того,
              чтобы дарить уют вашему дому.
            </p>
            <div class="flex gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-amber-600">3+</div>
                <div class="text-gray-600">года опыта</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-amber-600">500+</div>
                <div class="text-gray-600">довольных клиентов</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-amber-600">100%</div>
                <div class="text-gray-600">ручная работа</div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-amber-100 rounded-2xl p-6 text-center">
              <i class="pi pi-heart text-amber-600 text-4xl mb-4"></i>
              <h3 class="font-semibold text-blue-900">С любовью</h3>
            </div>
            <div class="bg-blue-100 rounded-2xl p-6 text-center">
              <i class="pi pi-leaf text-blue-600 text-4xl mb-4"></i>
              <h3 class="font-semibold text-blue-900">Натуральные материалы</h3>
            </div>
            <div class="bg-amber-100 rounded-2xl p-6 text-center">
              <i class="pi pi-palette text-amber-600 text-4xl mb-4"></i>
              <h3 class="font-semibold text-blue-900">Уникальный дизайн</h3>
            </div>
            <div class="bg-blue-100 rounded-2xl p-6 text-center">
              <i class="pi pi-gift text-blue-600 text-4xl mb-4"></i>
              <h3 class="font-semibold text-blue-900">Идеальный подарок</h3>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section id="categories" class="py-20 px-4">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-blue-900 text-center mb-4">Наши коллекции</h2>
        <p class="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Откройте для себя мир handmade изделий ручной работы
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div v-for="category in categories" :key="category.id"
               class="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 text-center group cursor-pointer"
               @click="$router.push('/categories')">
            <div class="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <i :class="category.icon" class="text-amber-700 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-blue-900 mb-2">{{ category.title }}</h3>
            <p class="text-gray-600 text-sm">{{ category.description }}</p>
            <div class="mt-4 text-amber-600 font-semibold">
              от {{ category.price }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Popular Products -->
    <section class="py-20 px-4 bg-white bg-opacity-50">
      <div class="max-w-7xl mx-auto">
        <h2 class="text-4xl font-bold text-blue-900 text-center mb-4">Популярные товары</h2>
        <p class="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Самые любимые нашими покупателями изделия
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div v-for="product in popularProducts" :key="product.id"
               class="bg-white rounded-2xl p-6 shadow-lg border border-amber-200 hover:shadow-xl transition-all duration-300">
            <div class="bg-amber-50 rounded-lg p-4 mb-4 text-center">
              <i :class="product.icon" class="text-amber-600 text-3xl"></i>
            </div>
            <h3 class="text-lg font-semibold text-blue-900 mb-2">{{ product.title }}</h3>
            <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>
            <div class="flex justify-between items-center">
              <span class="text-amber-600 font-bold text-lg">{{ product.price }}</span>
              <Button
                class="bg-amber-500 hover:bg-amber-400 border-none text-white text-sm py-2"
                @click="$router.push('/items')"
              >
                <i class="pi pi-shopping-cart mr-1"></i>
                Купить
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="py-20 px-4">
      <div class="max-w-6xl mx-auto">
        <h2 class="text-4xl font-bold text-blue-900 text-center mb-12">Почему выбирают нас</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center p-6">
            <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-truck text-blue-700 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-blue-900 mb-4">Быстрая доставка</h3>
            <p class="text-gray-600">Отправка заказов в день оформления по всей России</p>
          </div>
          <div class="text-center p-6">
            <div class="bg-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-shield text-amber-700 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-blue-900 mb-4">Гарантия качества</h3>
            <p class="text-gray-600">Все изделия проходят строгий контроль перед отправкой</p>
          </div>
          <div class="text-center p-6">
            <div class="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="pi pi-heart text-blue-700 text-2xl"></i>
            </div>
            <h3 class="text-xl font-semibold text-blue-900 mb-4">Индивидуальный подход</h3>
            <p class="text-gray-600">Возможность создания изделий по вашим эскизам</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 bg-blue-900 bg-opacity-5">
      <div class="max-w-4xl mx-auto text-center">
        <h2 class="text-4xl font-bold text-blue-900 mb-6">Готовы найти свой идеальный аромат?</h2>
        <p class="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          Присоединяйтесь к сообществу ценителей handmade изделий
        </p>
        <div class="flex justify-center gap-4 flex-wrap">
          <Button
            class="bg-blue-900 hover:bg-blue-800 border-none text-white font-semibold px-8 py-3 text-lg"
            @click="$router.push('/items')"
          >
            <i class="pi pi-shopping-bag mr-2"></i>
            Перейти в каталог
          </Button>
          <Button
            class="bg-white hover:bg-gray-100 border border-blue-900 text-blue-900 font-semibold px-8 py-3 text-lg"
            @click="$router.push('/categories')"
          >
            <i class="pi pi-images mr-2"></i>
            Смотреть коллекции
          </Button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import { ref } from 'vue';

const featuredProducts = ref([
  {
    id: 1,
    icon: 'pi pi-fire',
    title: 'Аромасвеча "Северный ветер"',
    description: 'С ароматом хвои и мандарина',
    price: '1 200 ₽'
  },
  {
    id: 2,
    icon: 'pi pi-star',
    title: 'Керамическая кружка',
    description: 'Ручная роспись, уникальный дизайн',
    price: '1 800 ₽'
  },
  {
    id: 3,
    icon: 'pi pi-moon',
    title: 'Аромадиффузор',
    description: 'Натуральные эфирные масла',
    price: '900 ₽'
  }
]);

const categories = ref([
  {
    id: 1,
    icon: 'pi pi-fire',
    title: 'Аромасвечи',
    description: 'Соевый воск, натуральные ароматы',
    price: '800 ₽'
  },
  {
    id: 2,
    icon: 'pi pi-palette',
    title: 'Керамика',
    description: 'Посуда и декор ручной работы',
    price: '1 500 ₽'
  },
  {
    id: 3,
    icon: 'pi pi-gem',
    title: 'Украшения',
    description: 'Бижутерия из натуральных материалов',
    price: '600 ₽'
  },
  {
    id: 4,
    icon: 'pi pi-home',
    title: 'Домашний декор',
    description: 'Элементы для уюта в вашем доме',
    price: '1 200 ₽'
  }
]);

const popularProducts = ref([
  {
    id: 1,
    icon: 'pi pi-fire',
    title: 'Свеча "Лесная сказка"',
    description: 'Хвоя, корица и ваниль',
    price: '950 ₽'
  },
  {
    id: 2,
    icon: 'pi pi-mug',
    title: 'Кружка "Северное сияние"',
    description: 'Ручная работа, глазурь',
    price: '1 600 ₽'
  },
  {
    id: 3,
    icon: 'pi pi-heart',
    title: 'Подвеска "Лис"',
    description: 'Дерево, ручная резьба',
    price: '750 ₽'
  },
  {
    id: 4,
    icon: 'pi pi-leaf',
    title: 'Саше "Уютный дом"',
    description: 'Травы и цветы для шкафа',
    price: '550 ₽'
  }
]);

const scrollToCategories = () => {
  const element = document.getElementById('categories');
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* Дополнительные стили для красоты */
</style>
