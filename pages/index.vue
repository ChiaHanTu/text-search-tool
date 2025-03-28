<script setup lang="ts">
import { ref } from 'vue'

// 搜尋條件
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
        includedType: !!searchForm.value.includedType ? searchForm.value.includedType : undefined,
        strictTypeFiltering: !!searchForm.value.includedType,
        pageToken: pageToken
      }),
      mode: 'cors'
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 錯誤:', errorData);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // 如果是第一頁，清空之前的結果
    if (!pageToken) {
      searchResults.value = [];
    }

    // 添加新的結果
    if (data.places) {
      searchResults.value = [...searchResults.value, ...data.places];
    }

    // 如果有下一頁，繼續搜尋
    if (data.nextPageToken && searchResults.value.length < 100) {
      await search(data.nextPageToken);
    }

    console.log('搜尋結果:', searchResults.value);
  } catch (error) {
    console.error('搜尋失敗:', error);
  }
}
</script>

<template>
  <div class="search-page">
    <h1 class="text-2xl font-bold mb-4">
      Google Maps Text search API tool
    </h1>
    <div class="search-form bg-[#f5f5f5]">
      <div class="flex justify-center items-center gap-x-4">
        <div class="space-x-2">
          <label for="keyword">關鍵字</label>
          <input
            id="keyword"
            v-model="searchForm.keyword"
            type="text"
            placeholder="請輸入關鍵字"
            class="bg-white px-3 py-2 rounded-xl focus:outline-none"
          >
        </div>
        <div class="space-x-2">
          <label for="includedType">類型（選填）</label>
          <input
            id="includedType"
            v-model="searchForm.includedType"
            type="text"
            placeholder="請輸入類型"
            class="bg-white px-3 py-2 rounded-xl focus:outline-none"
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
          class="px-4 py-2 rounded-xl bg-gray-300 cursor-pointer"
          @click="() => search()"
        >
          搜尋
        </button>
      </div>
    </div>

    <div class="search-results">
      <h2>搜尋結果 ({{ searchResults.length }})</h2>
      <div class="results-list">
        <div
          v-for="place in searchResults"
          :key="place.id"
          class="result-item"
        >
          <h3>{{ place.displayName.text }}</h3>
          <span>{{ place.formattedAddress }}</span>
          <a>{{ place.googleMapsUri }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.search-page {
  margin: 0 auto;
  padding: 20px;
  max-width: 1200px;
}

.search-form {
  margin-bottom: 30px;
  padding: 20px;
  border-radius: 8px;
}

.form-input {
  padding: 8px 12px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;

  &:focus {
    border-color: #4a90e2;
    outline: none;
  }
}

.search-results {
  h2 {
    margin-bottom: 20px;
  }
}

.results-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.result-item {
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;

  h3 {
    margin: 0 0 10px;
    font-size: 16px;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #666;
  }
}
</style>
