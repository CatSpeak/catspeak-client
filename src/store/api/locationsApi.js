import { baseApi } from "./baseApi"

export const locationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/v1/Locations/countries
    getCountries: builder.query({
      query: () => `/v1/Locations/countries`,
      providesTags: ["Locations"],
    }),

    // GET /api/v1/Locations/countries/{countryId}/cities
    getCitiesByCountryId: builder.query({
      query: (countryId) => `/v1/Locations/countries/${countryId}/cities`,
      providesTags: (result, error, countryId) => [
        { type: "Locations", id: `cities-${countryId}` },
      ],
    }),
  }),
})

export const { useGetCountriesQuery, useGetCitiesByCountryIdQuery } = locationsApi
