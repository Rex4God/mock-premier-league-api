import { Response } from 'express';

interface PaginatedData<T = any> {
  docs?: T[]; 
  data?: T[]; 
  page: string | number;
  [key: string]: any;
}

export const success = <T>(res: Response, data: T, code: number = 200): Response => {
  return res.status(code).json({ data });
};

export const paginated = <T>(res: Response, data: PaginatedData<T>, code: number = 200): Response => {
  if (data.docs) {
    data.data = data.docs;
    delete data.docs; 
  }

  if (typeof data.page === 'string') {
    const parsedPage = parseInt(data.page, 10);
    data.page = !isNaN(parsedPage) ? parsedPage : 0; 
  }

  return res.status(code).json({
    message: "Paginated Response",
    ...data,
  });
};

export const error = (res: Response, error: string = "Oops. An Error Occurred", code: number = 500): Response => {
  console.error("Error Response:", error);
  
  return res.status(code).json({
    error,
  });
};
