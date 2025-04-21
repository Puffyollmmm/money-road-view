/**
 * 账本API模拟服务
 */

/**
 * 账本数据类型
 */
export interface BookItem {
  id: string;
  name: string;
  description?: string;
  color: string[];
  icon: string;
  ownerId: string;
  collaborators: Array<{
    id: string;
    name: string;
    avatar?: string;
    permission: 'read' | 'write' | 'admin';
    joinedAt: string;
  }>;
  createdAt: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}

/**
 * 创建账本请求数据类型
 */
export interface CreateBookDTO {
  name: string;
  description?: string;
  color: string[];
  icon: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}

/**
 * 更新账本请求数据类型
 */
export interface UpdateBookDTO {
  name?: string;
  description?: string;
  color?: string[];
  icon?: string;
  tags?: string[];
  tagColors?: string[][];
  budget?: number;
  period?: 'month' | 'week' | 'year';
  note?: string;
}

// 模拟数据存储
const mockUserId = 'user1';
let mockBooks: BookItem[] = [];

// 从本地存储加载数据
function loadBooksFromStorage(): void {
  const storedBooks = localStorage.getItem('books');
  if (storedBooks) {
    mockBooks = JSON.parse(storedBooks);
  }
}

// 保存数据到本地存储
function saveBooksToStorage(): void {
  localStorage.setItem('books', JSON.stringify(mockBooks));
}

// 初始化加载数据
loadBooksFromStorage();

/**
 * 获取所有账本
 * @returns 账本列表
 */
export async function getBooks(): Promise<BookItem[]> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockBooks;
}

/**
 * 获取单个账本
 * @param bookId 账本ID
 * @returns 账本信息
 */
export async function getBook(bookId: string): Promise<BookItem | null> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 200));
  return mockBooks.find(book => book.id === bookId) || null;
}

/**
 * 添加新账本
 * @param bookData 账本数据
 * @returns 创建的账本
 */
export async function addBook(bookData: CreateBookDTO): Promise<BookItem> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 500));

  const newBook: BookItem = {
    id: `book_${Date.now()}`,
    ...bookData,
    ownerId: mockUserId,
    collaborators: [],
    createdAt: new Date().toISOString(),
  };

  mockBooks.push(newBook);
  saveBooksToStorage();

  return newBook;
}

/**
 * 更新账本信息
 * @param bookId 账本ID
 * @param bookData 要更新的数据
 * @returns 更新后的账本
 */
export async function updateBook(bookId: string, bookData: UpdateBookDTO): Promise<BookItem | null> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 400));

  const bookIndex = mockBooks.findIndex(book => book.id === bookId);
  if (bookIndex === -1) {
    return null;
  }

  // 更新账本信息
  mockBooks[bookIndex] = {
    ...mockBooks[bookIndex],
    ...bookData,
  };

  saveBooksToStorage();

  return mockBooks[bookIndex];
}

/**
 * 删除账本
 * @param bookId 账本ID
 * @returns 操作是否成功
 */
export async function deleteBook(bookId: string): Promise<boolean> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 300));

  const initialLength = mockBooks.length;
  mockBooks = mockBooks.filter(book => book.id !== bookId);

  if (mockBooks.length !== initialLength) {
    saveBooksToStorage();
    return true;
  }

  return false;
}

/**
 * 添加协作者
 * @param bookId 账本ID
 * @param collaborator 协作者信息
 * @returns 更新后的账本
 */
export async function addCollaborator(
  bookId: string,
  collaborator: {
    id: string;
    name: string;
    avatar?: string;
    permission: 'read' | 'write' | 'admin';
  },
): Promise<BookItem | null> {
  // 模拟API请求延迟
  await new Promise(resolve => setTimeout(resolve, 400));

  const bookIndex = mockBooks.findIndex(book => book.id === bookId);
  if (bookIndex === -1) {
    return null;
  }

  // 添加协作者
  mockBooks[bookIndex].collaborators.push({
    ...collaborator,
    joinedAt: new Date().toISOString(),
  });

  saveBooksToStorage();

  return mockBooks[bookIndex];
}
