import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CatalogItem, DEFAULT_ITEMS, getPrimaryProductImage, getProductImages } from "@/lib/catalog";
import { API_ROUTES } from "@/lib/api-routes";

type ItemsState = {
  items: CatalogItem[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
};

const initialState: ItemsState = {
  items: DEFAULT_ITEMS,
  loading: false,
  error: null,
  loaded: false,
};

const getItemId = (item: CatalogItem) => String(item._id || item.id || "");

const itemPayload = (item: CatalogItem) => ({
  name: item.name,
  brand: item.brand,
  subCategory: item.subCategory,
  description: item.description || "",
  seoTitle: item.seoTitle || "",
  seoDescription: item.seoDescription || "",
  seoKeywords: item.seoKeywords || "",
  defaultPrice: item.defaultPrice,
  originalPrice: item.originalPrice,
  stock: item.stock,
  image: getPrimaryProductImage(item),
  images: getProductImages(item),
  video: item.video || "",
  videoId: item.videoId || "",
  featured: Boolean(item.featured),
  imageFit: item.imageFit || "fit",
});

const readError = async (response: Response, fallback: string) => {
  try {
    const result = await response.json();
    return result.error || fallback;
  } catch {
    return fallback;
  }
};

export const fetchItems = createAsyncThunk<CatalogItem[]>(
  "items/fetchItems",
  async () => {
    const response = await fetch(API_ROUTES.items);

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load items"));
    }

    const result = await response.json();
    return result.data || DEFAULT_ITEMS;
  }
);

export const fetchItemById = createAsyncThunk<CatalogItem, string>(
  "items/fetchItemById",
  async (id) => {
    const response = await fetch(`${API_ROUTES.items}/${id}`);

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to load item"));
    }

    const result = await response.json();
    return result.data;
  }
);

export const saveItem = createAsyncThunk<CatalogItem, CatalogItem>(
  "items/saveItem",
  async (item) => {
    const id = getItemId(item);
    const isUpdate = Boolean(item._id);
    const response = await fetch(isUpdate ? `${API_ROUTES.items}/${id}` : API_ROUTES.items, {
      method: isUpdate ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(itemPayload(item)),
    });

    if (!response.ok) {
      throw new Error(await readError(response, isUpdate ? "Failed to update item" : "Failed to create item"));
    }

    const result = await response.json();
    return result.data;
  }
);

export const deleteItemById = createAsyncThunk<string, string>(
  "items/deleteItemById",
  async (id) => {
    const response = await fetch(`${API_ROUTES.items}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(await readError(response, "Failed to delete item"));
    }

    return id;
  }
);

const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems(state, action: PayloadAction<CatalogItem[]>) {
      state.items = action.payload;
      state.loaded = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.loaded = true;
      })
      .addCase(fetchItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load items";
      })
      .addCase(fetchItemById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchItemById.fulfilled, (state, action) => {
        const id = getItemId(action.payload);
        const index = state.items.findIndex((item) => getItemId(item) === id);

        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }

        state.loading = false;
      })
      .addCase(fetchItemById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load item";
      })
      .addCase(saveItem.fulfilled, (state, action) => {
        const id = getItemId(action.payload);
        const index = state.items.findIndex((item) => getItemId(item) === id);

        if (index >= 0) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteItemById.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => getItemId(item) !== action.payload);
      });
  },
});

export const { setItems } = itemsSlice.actions;
export const itemsReducer = itemsSlice.reducer;
