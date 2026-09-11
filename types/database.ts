export type UserRole = "student" | "librarian";

export type Profile = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: number;
  profile_id: string;
  matric_number: string;
  department: string | null;
  faculty: string | null;
  level: number | null;
  created_at: string;
};

export type Librarian = {
  id: number;
  profile_id: string;
  staff_id: string;
  created_at: string;
};

export type Category = {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
};

export type Book = {
  id: number;
  category_id: number | null;
  title: string;
  author: string;
  isbn: string | null;
  publisher: string | null;
  publication_year: number | null;
  description: string | null;
  cover_image: string | null;
  created_at: string;
  updated_at: string;
};

export type BookCopy = {
  id: number;
  book_id: number;
  barcode: string;
  status:
    | "available"
    | "borrowed"
    | "lost"
    | "damaged"
    | "maintenance";
  created_at: string;
};

export type Borrowing = {
  id: number;
  student_id: number;
  book_copy_id: number;
  issued_by: number | null;
  borrowed_at: string;
  due_date: string;
  returned_at: string | null;
  returned_to: number | null;
  status: "borrowed" | "returned" | "overdue";
};

export type Fine = {
  id: number;
  borrowing_id: number;
  student_id: number;
  amount: number;
  reason: string;
  status: "unpaid" | "paid" | "waived";
  created_at: string;
  paid_at: string | null;
};

export type Notification = {
  id: number;
  profile_id: string;
  title: string;
  message: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
};