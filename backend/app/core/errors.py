class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


INVALID_FILE_TYPE = "INVALID_FILE_TYPE"
FILE_TOO_LARGE = "FILE_TOO_LARGE"
FILE_TOO_LONG = "FILE_TOO_LONG"
FILE_NOT_FOUND = "FILE_NOT_FOUND"
SESSION_NOT_FOUND = "SESSION_NOT_FOUND"
FFPROBE_ERROR = "FFPROBE_ERROR"
INVALID_CUT_RANGE = "INVALID_CUT_RANGE"
ANALYSIS_FAILED = "ANALYSIS_FAILED"
AMPLIFY_FAILED = "AMPLIFY_FAILED"
KEY_SHIFT_FAILED = "KEY_SHIFT_FAILED"
STEM_SEPARATION_FAILED = "STEM_SEPARATION_FAILED"
STEM_MIX_FAILED = "STEM_MIX_FAILED"
