
export const TOKEN_TAG_OPEN = 'token::tag-open';
export const TOKEN_STRING = 'token::string';
export const TOKEN_SINGLE_QUOTED_STRING = 'token::single-quoted-string';
export const TOKEN_DOUBLE_QUOTED_STRING = 'token::double-quoted-string';
export const TOKEN_EXPRESSION = 'token::expression';
export const TOKEN_SINGLE_QUOTED_STRING_START = 'token::single-quoted-string-start';
export const TOKEN_SINGLE_QUOTED_STRING_MIDDLE = 'token::single-quoted-string-middle';
export const TOKEN_SINGLE_QUOTED_STRING_END = 'token::single-quoted-string-end';
export const TOKEN_DOUBLE_QUOTED_STRING_START = 'token::double-quoted-string-start';
export const TOKEN_DOUBLE_QUOTED_STRING_MIDDLE = 'token::double-quoted-string-middle';
export const TOKEN_DOUBLE_QUOTED_STRING_END = 'token::double-quoted-string-end';
export const TOKEN_FORWARD_SLASH = 'token::forward-slash';
export const TOKEN_ASSIGN = 'token::assign';
export const TOKEN_TAG_CLOSE = 'token::tag-close';

export type TokenType = typeof TOKEN_TAG_OPEN |
	typeof TOKEN_TAG_CLOSE |
	typeof TOKEN_STRING |
	typeof TOKEN_SINGLE_QUOTED_STRING |
	typeof TOKEN_DOUBLE_QUOTED_STRING |
	typeof TOKEN_EXPRESSION |
	typeof TOKEN_SINGLE_QUOTED_STRING_START |
	typeof TOKEN_SINGLE_QUOTED_STRING_MIDDLE |
	typeof TOKEN_SINGLE_QUOTED_STRING_END |
	typeof TOKEN_DOUBLE_QUOTED_STRING_START |
	typeof TOKEN_DOUBLE_QUOTED_STRING_MIDDLE |
	typeof TOKEN_DOUBLE_QUOTED_STRING_END |
	typeof TOKEN_ASSIGN |
	typeof TOKEN_FORWARD_SLASH;
