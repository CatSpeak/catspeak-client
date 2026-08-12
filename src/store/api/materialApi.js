import { baseApi } from "./baseApi";

export const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PERSONAL MATERIALS

    //  Get a list of personal materials
    getPersonalMaterials: builder.query({
      query: ({ folderId, keyword, sortBy } = {}) => ({
        url: "/personal-materials",
        params: { folderId, keyword, sortBy },
      }),
      providesTags: ["PersonalMaterials"],
    }),

    // Get a list of bookmarked materials
    getBookmarkedMaterials: builder.query({
      query: ({ keyword, sortBy, sortOrder } = {}) => ({
        url: "/personal-materials/bookmarks",
        params: { keyword, sortBy, sortOrder },
      }),
      providesTags: ["PersonalMaterials"],
    }),

    //  Create a new folder
    createFolder: builder.mutation({
      query: ({ name, parentId }) => ({
        url: "/personal-materials/folders",
        method: "POST",
        body: { name, parentId },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Get the folder tree structure
    getFolderTree: builder.query({
      query: () => "/personal-materials/folders/tree",
      providesTags: ["PersonalMaterials"],
    }),

    //  Upload a new file
    uploadMaterial: builder.mutation({
      query: (formData) => ({
        url: "/personal-materials/upload",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Get details of a specific personal material or folder by ID
    getPersonalMaterialById: builder.query({
      query: (id) => `/personal-materials/${id}`,
      providesTags: (result, error, id) => [{ type: "PersonalMaterials", id }],
    }),

    //  Delete a personal material (file)
    deletePersonalMaterial: builder.mutation({
      query: (id) => ({
        url: `/personal-materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Delete a personal folder
    deleteFolder: builder.mutation({
      query: (id) => ({
        url: `/personal-materials/folders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Update settings of an existing personal material (file)
    updateMaterialSettings: builder.mutation({
      query: ({ id, isPublic, allowDownload }) => ({
        url: `/personal-materials/${id}/settings`,
        method: "PUT",
        body: { isPublic, allowDownload },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PersonalMaterials", id },
        "PersonalMaterials",
      ],
    }),

    // Update settings of a personal folder
    updateFolderSettings: builder.mutation({
      query: ({ id, isPublic }) => ({
        url: `/personal-materials/folders/${id}/settings`,
        method: "PUT",
        body: { isPublic },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PersonalMaterials", id },
        "PersonalMaterials",
      ],
    }),

    // Toggle material share link
    toggleMaterialShare: builder.mutation({
      query: ({ materialId, isPublic }) => ({
        url: `/personal-materials/share/${materialId}/toggle`,
        method: "POST",
        body: { isPublic },
      }),
      invalidatesTags: (result, error, { materialId }) => [
        { type: "PersonalMaterials", id: materialId },
        "PersonalMaterials",
      ],
    }),

    // Get material by share token
    getMaterialByShareToken: builder.query({
      query: (shareToken) => `/personal-materials/share/${shareToken}`,
      providesTags: ["PersonalMaterials"],
    }),

    // Bookmark a personal folder
    bookmarkFolder: builder.mutation({
      query: (id) => ({
        url: `/personal-materials/folders/${id}/bookmark`,
        method: "PUT",
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Rename a folder
    renameFolder: builder.mutation({
      query: ({ id, name }) => ({
        url: `/personal-materials/folders/${id}/rename`,
        method: "PUT",
        body: { name },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Bookmark a personal material (file)
    bookmarkMaterial: builder.mutation({
      query: (id) => ({
        url: `/personal-materials/${id}/bookmark`,
        method: "PUT",
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Rename a personal material (file)
    renameMaterial: builder.mutation({
      query: ({ id, fileName }) => ({
        url: `/personal-materials/${id}/rename`,
        method: "PUT",
        body: { fileName: fileName },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Move a personal material
    moveMaterial: builder.mutation({
      query: ({ id, targetFolderId }) => ({
        url: `/personal-materials/${id}/move`,
        method: "PUT",
        body: { targetFolderId },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Move a personal folder
    moveFolder: builder.mutation({
      query: ({ id, targetFolderId }) => ({
        url: `/personal-materials/folders/${id}/move`,
        method: "PUT",
        body: { targetFolderId },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Bulk move materials and folders
    moveMaterialsBulk: builder.mutation({
      query: ({ folderIds, materialIds, targetFolderId }) => ({
        url: `/personal-materials/bulk/move`,
        method: "POST",
        body: { folderIds, materialIds, targetFolderId },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // Bulk delete materials and folders
    deleteMaterialsBulk: builder.mutation({
      query: ({ folderIds, materialIds }) => ({
        url: `/personal-materials/bulk/delete`,
        method: "POST",
        body: { folderIds, materialIds },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    // PUBLIC PERSONAL MATERIALS

    //  Get details of a specific public material by ID
    getPublicMaterialById: builder.query({
      query: (id) => `/public/personal-materials/${id}`,
      providesTags: (result, error, id) => [{ type: "PersonalMaterials", id }],
    }),

    //  Record a view for a public material
    recordMaterialView: builder.mutation({
      query: (id) => ({
        url: `/public/personal-materials/${id}/view`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PersonalMaterials", id },
      ],
    }),

    //  Record a download for a public material
    recordMaterialDownload: builder.mutation({
      query: (id) => ({
        url: `/public/personal-materials/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PersonalMaterials", id },
        "PersonalMaterials",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPersonalMaterialsQuery,
  useGetBookmarkedMaterialsQuery,
  useCreateFolderMutation,
  useGetFolderTreeQuery,
  useUploadMaterialMutation,
  useGetPersonalMaterialByIdQuery,
  useDeletePersonalMaterialMutation,
  useDeleteFolderMutation,
  useUpdateMaterialSettingsMutation,
  useUpdateFolderSettingsMutation,
  useBookmarkMaterialMutation,
  useBookmarkFolderMutation,
  useGetPublicMaterialByIdQuery,
  useRecordMaterialViewMutation,
  useRecordMaterialDownloadMutation,
  useRenameMaterialMutation,
  useRenameFolderMutation,
  useMoveMaterialMutation,
  useMoveFolderMutation,
  useMoveMaterialsBulkMutation,
  useDeleteMaterialsBulkMutation,
  useToggleMaterialShareMutation,
  useGetMaterialByShareTokenQuery,
} = materialApi;
