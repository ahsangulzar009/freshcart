

interface ResError{
    success: false;
    message: string;
}

export type ApiResponse<SuccessType> =
    ({ success: true } & SuccessType)
    | ResError
