<script setup lang="ts">
import { ref } from 'vue'

interface SearchForm {
  keyword: string;
  includedType?: string;
}

const searchForm = ref<SearchForm>({
  keyword: '',
  includedType: undefined,
})

const config = useRuntimeConfig();

// 搜尋結果
const searchResults = ref<any[]>([])

const search = async (pageToken?: string) => {
  try {
    if (!searchForm.value.keyword) return;

    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.types,nextPageToken',
        'X-Goog-Api-Key': config.public.mapsKey,
      },
      body: JSON.stringify({
        textQuery: searchForm.value.keyword,
        includedType: searchForm.value.includedType || undefined,
        strictTypeFiltering: !!searchForm.value.includedType,
        pageToken: pageToken
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 錯誤:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!pageToken) {
      searchResults.value = [];
    }

    if (data.places) {
      searchResults.value = [...searchResults.value, ...data.places];
    }

    if (data.nextPageToken) {
      await search(data.nextPageToken);
    }

    console.log('搜尋結果:', searchResults.value);
  } catch (error) {
    console.error('搜尋失敗:', error);
  }
}
</script>

<template>
  <div class="mx-auto p-5 max-w-7xl">
    <h1 class="text-center text-2xl font-bold mb-4">
      Google Maps Text search API tool
    </h1>
    <div class="mb-8 p-5 rounded-lg bg-[#f5f5f5]">
      <div class="flex justify-center items-center gap-x-4">
        <div class="space-x-2">
          <label for="keyword">關鍵字</label>
          <input
            id="keyword"
            v-model="searchForm.keyword"
            type="text"
            placeholder="請輸入關鍵字"
            class="px-3 py-2 text-base bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
          >
        </div>
        <div class="space-x-2">
          <label for="includedType">類型（選填）</label>
          <input
            id="includedType"
            v-model="searchForm.includedType"
            type="text"
            placeholder="請輸入類型"
            class="px-3 py-2 text-base bg-white border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
          >
          <a
            href="https://developers.google.com/maps/documentation/places/web-service/place-types?hl=zh-tw"
            class="text-gray-400"
            target="_blank"
          >
            參考
          </a>
        </div>

        <button
          class="px-4 py-2 rounded-xl bg-gray-300 cursor-pointer hover:bg-gray-400 transition-colors"
          @click="() => search()"
        >
          搜尋
        </button>
      </div>
    </div>

    <div>
      <h2 class="mb-5">
        搜尋結果 ({{ searchResults.length }})
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="place in searchResults"
          :key="place.id"
          class="p-4 bg-white border border-gray-300 rounded-md"
        >
          <h3 class="m-0 mb-2.5 text-base">
            {{ place.displayName.text }}
          </h3>
          <span class="block text-sm text-gray-600 mb-2">{{ place.formattedAddress }}</span>
          <a
            :href="place.googleMapsUri"
            class="text-blue-500 hover:text-blue-600"
            target="_blank"
          >
            Maps 連結
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

