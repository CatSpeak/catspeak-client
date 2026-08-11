import { baseApi } from "./baseApi"

export const materialApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // PERSONAL MATERIALS

    //  Get a list of personal materials
    getPersonalMaterials: builder.query({
      query: ({ folderId, keyword, sortBy } = {}) => ({
        url: "/teacher/personal-materials",
        params: { folderId, keyword, sortBy },
      }),
      providesTags: ["PersonalMaterials"],
    }),

    //  Create a new folder
    createFolder: builder.mutation({
      query: ({ name, parentId }) => ({
        url: "/teacher/personal-materials/folders",
        method: "POST",
        body: { name, parentId },
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Get the folder tree structure
    getFolderTree: builder.query({
      query: () => "/teacher/personal-materials/folders/tree",
      providesTags: ["PersonalMaterials"],
    }),

    //  Upload a new file
    uploadMaterial: builder.mutation({
      query: (formData) => ({
        url: "/teacher/personal-materials/upload",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Get details of a specific personal material or folder by ID
    getPersonalMaterialById: builder.query({
      query: (id) => `/teacher/personal-materials/${id}`,
      providesTags: (result, error, id) => [{ type: "PersonalMaterials", id }],
    }),

    //  Delete a personal material or folder
    deletePersonalMaterial: builder.mutation({
      query: (id) => ({
        url: `/teacher/personal-materials/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["PersonalMaterials"],
    }),

    //  Update settings of an existing personal material or folder
    updateMaterialSettings: builder.mutation({
      query: ({ id, isPublic, allowDownload }) => ({
        url: `/teacher/personal-materials/${id}/settings`,
        method: "PUT",
        body: { isPublic, allowDownload },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PersonalMaterials", id },
        "PersonalMaterials",
      ],
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
      invalidatesTags: (result, error, id) => [{ type: "PersonalMaterials", id }],
    }),

    //  Record a download for a public material
    recordMaterialDownload: builder.mutation({
      query: (id) => ({
        url: `/public/personal-materials/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: (result, error, id) => [{ type: "PersonalMaterials", id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetPersonalMaterialsQuery,
  useCreateFolderMutation,
  useGetFolderTreeQuery,
  useUploadMaterialMutation,
  useGetPersonalMaterialByIdQuery,
  useDeletePersonalMaterialMutation,
  useUpdateMaterialSettingsMutation,
  useGetPublicMaterialByIdQuery,
  useRecordMaterialViewMutation,
  useRecordMaterialDownloadMutation,
} = materialApi
