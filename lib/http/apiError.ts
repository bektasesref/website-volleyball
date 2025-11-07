export class ApiError<T = unknown> extends Error {
  constructor(
    message: string,
    options: {
      status?: number;
      data?: T;
    } = {}
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.data = options.data;
  }

  status?: number;
  data?: T;
}

