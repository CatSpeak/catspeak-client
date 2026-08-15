# Dropdown Component Documentation

Tài liệu hướng dẫn sử dụng và đặc tả kỹ thuật cho component `Dropdown` (`src/shared/components/ui/Dropdown.jsx`).

---

## Tổng quan & Nguyên lý hoạt động

1. **React Portal Rendering**:
   - Menu dropdown được render trực tiếp vào `document.body` thông qua `createPortal`.
   - Giúp menu không bị ảnh hưởng hoặc bị che khuất bởi các thuộc tính `overflow: hidden`, `z-index` hoặc stacking context của các component cha.

2. **Tự động căn chỉnh & Lật vị trí thông minh (Auto-flip & Auto-align)**:
   - Khi dropdown mở ra, component tự động tính toán toạ độ (`getBoundingClientRect()`).
   - Nếu khoảng cách bên dưới màn hình còn ít hơn ~300px và bên trên còn nhiều khoảng trống hơn, menu sẽ tự động **lật ngược lên trên** (`flipUp`).
   - Nếu vị trí hiển thị bị tràn ra ngoài cạnh phải màn hình (`rect.left + 260 > window.innerWidth`), menu sẽ tự động ép căn phải (`forceAlignRight`).
   - Tự động bám theo trigger khi cuộn trang (`window.addEventListener("scroll")`) và tự hủy listener khi đóng.

3. **Flow quản lý lựa chọn (Selection Flow)**:
   - **Single Choice (`mode="single"`)**: `value` là giá trị đơn (string, number,...). Khi chọn 1 item, gọi `onChange(option.value, option)` và mặc định đóng dropdown ngay lập tức.
   - **Multiple Choice (`mode="multiple"`)**: `value` là một mảng `[]`. Khi bấm vào 1 item, nó sẽ toggle thêm/bớt khỏi mảng `selectedValues`, gọi `onChange(newValues, newOptions)` và **không đóng dropdown** để người dùng tiếp tục chọn các mục khác.

4. **Tìm kiếm: Client-side vs Dynamic API Search**:
   - **Client-side Search (`enableSearch={true}`)**: Lọc trực tiếp trên mảng `options` truyền vào, hỗ trợ tìm kiếm không phân biệt chữ hoa/thường, loại bỏ dấu tiếng Việt (`removeDiacritics`), quét qua `label`, `value`, `subtitle`, `searchTerms`.
   - **Dynamic API Search (`handleSearch={(keyword) => ...}`)**: Khi người dùng gõ vào ô tìm kiếm, component sẽ tự động debounce (mặc định 300ms) và gọi hàm `handleSearch(searchQuery)` để component cha / API thực hiện truy vấn và cập nhật lại mảng `options`.

---

## Props

| Tên Prop            | Kiểu dữ liệu                        | Mặc định                        | Ý nghĩa & Mô tả                                                                                                                   |
| :------------------ | :---------------------------------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------- |
| `options`           | `Array<Option>`                     | `[]`                            | Mảng danh sách các lựa chọn hiển thị trong dropdown.                                                                              |
| `value`             | `any` \| `Array<any>`               | `undefined`                     | Giá trị đang được chọn. Là giá trị đơn trong chế độ `single`, hoặc mảng `[]` trong chế độ `multiple`.                             |
| `onChange`          | `Function`                          | `undefined`                     | Callback khi giá trị thay đổi. <br>• **Single**: `(value, option) => void`<br>• **Multiple**: `(newValues, newOptions) => void`   |
| `mode`              | `"single"` \| `"multiple"`          | `"single"`                      | Chế độ chọn đơn hoặc chọn nhiều.                                                                                                  |
| `enableSearch`      | `boolean`                           | `false`                         | Bật/tắt ô tìm kiếm trong dropdown menu. (Tự động bật nếu có truyền `handleSearch`).                                               |
| `handleSearch`      | `(keyword: string) => void`         | `undefined`                     | Hàm callback nhận keyword tìm kiếm để gọi API lấy dynamic options từ server.                                                      |
| `loading`           | `boolean`                           | `false`                         | Trạng thái hiển thị spinner loading khi đang fetch dữ liệu từ API.                                                                |
| `searchDebounceMs`  | `number`                            | `300`                           | Thời gian debounce (mili-giây) trước khi gọi `handleSearch`.                                                                      |
| `searchPlaceholder` | `string`                            | `undefined`                     | Placeholder cho ô tìm kiếm (tự động fallback theo i18n).                                                                          |
| `placeholder`       | `string`                            | `"Select..."`                   | Text hiển thị trên trigger button khi chưa có giá trị nào được chọn.                                                              |
| `trigger`           | `ReactNode` \| `Function`           | `undefined`                     | Tùy biến nút bấm trigger mở dropdown. Có thể truyền element hoặc hàm render: `(isOpen, selectedData, toggle, meta) => ReactNode`. |
| `renderOption`      | `Function`                          | `undefined`                     | Tùy biến cách render từng option: `(option, isSelected, meta) => ReactNode`.                                                      |
| `align`             | `"left"` \| `"right"` \| `"center"` | `"left"`                        | Hướng căn lề của menu so với nút trigger.                                                                                         |
| `disabled`          | `boolean`                           | `false`                         | Vô hiệu hoá không cho tương tác mở dropdown.                                                                                      |
| `closeOnSelect`     | `boolean`                           | `undefined`                     | Ghi đè hành vi đóng menu sau khi chọn. Mặc định `true` cho single, `false` cho multiple.                                          |
| `className`         | `string`                            | `""`                            | Class CSS mở rộng cho container wrapper bên ngoài.                                                                                |
| `triggerClassName`  | `string`                            | `""`                            | Class CSS mở rộng cho nút trigger mặc định.                                                                                       |
| `dropdownClassName` | `string`                            | `"min-w-[260px] max-w-[260px]"` | Class CSS tùy chỉnh kích thước chiều rộng/giao diện menu popup.                                                                   |
| `maxHeightClass`    | `string`                            | `"max-h-[250px]"`               | Class Tailwind quy định chiều cao tối đa trước khi xuất hiện scrollbar.                                                           |
| `roundedClass`      | `string`                            | `"rounded-full"`                | Class bo góc cho nút trigger mặc định.                                                                                            |
| `activeColor`       | `string`                            | `colors.primaryRed`             | Màu highlight cho option đang được chọn.                                                                                          |

---

## Samples

### Single Choice

```jsx
const SingleSelectExample = () => {
  const [lang, setLang] = useState("vi")

  const options = [
    { label: "Tiếng Việt", value: "vi", icon: <Globe size={16} /> },
    { label: "English", value: "en", icon: <Globe size={16} /> },
    { label: "中文", value: "zh", icon: <Globe size={16} /> },
  ]

  return (
    <Dropdown
      options={options}
      value={lang}
      onChange={(val) => setLang(val)}
      placeholder="Chọn ngôn ngữ"
      className="w-60"
    />
  )
}
```

---

### Multiple Choice (Chọn nhiều mục có Checkbox)

```jsx
import React, { useState } from "react"
import Dropdown from "@/shared/components/ui/Dropdown"

const MultiChoiceExample = () => {
  const [selectedTags, setSelectedTags] = useState(["react", "tailwind"])

  const tagOptions = [
    { label: "React", value: "react" },
    { label: "Vue.js", value: "vue" },
    { label: "Angular", value: "angular" },
    { label: "Tailwind CSS", value: "tailwind" },
    { label: "Next.js", value: "nextjs" },
  ]

  return (
    <Dropdown
      mode="multiple"
      options={tagOptions}
      value={selectedTags}
      onChange={(newValues, newOptions) => {
        setSelectedTags(newValues)
      }}
      placeholder="Chọn các công nghệ..."
      className="w-72"
    />
  )
}
```

---

### Dynamic API Search (Truy vấn dữ liệu động từ Backend)

```jsx
import React, { useState, useCallback } from "react"
import Dropdown from "@/shared/components/ui/Dropdown"
import { useLazySearchUsersQuery } from "@/store/api/userApi"

const DynamicSearchDropdown = () => {
  const [selectedUser, setSelectedUser] = useState(null)
  const [userOptions, setUserOptions] = useState([])
  const [triggerSearch, { isLoading }] = useLazySearchUsersQuery()

  const handleSearchUsers = useCallback(
    async (keyword) => {
      try {
        const response = await triggerSearch({ query: keyword }).unwrap()
        const formattedOptions = response.map((user) => ({
          label: user.fullName,
          value: user.id,
          subtitle: user.email,
        }))
        setUserOptions(formattedOptions)
      } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error)
      }
    },
    [triggerSearch],
  )

  return (
    <Dropdown
      options={userOptions}
      value={selectedUser}
      onChange={(val, opt) => setSelectedUser(val)}
      handleSearch={handleSearchUsers}
      loading={isLoading}
      searchDebounceMs={400}
      placeholder="Tìm kiếm thành viên..."
      className="w-80"
    />
  )
}
```
