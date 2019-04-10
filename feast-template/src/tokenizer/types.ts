
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

export const CHAR_EOF = -1;

export const CHAR_SPACE = 0x20;
export const CHAR_TAB = 0x9;
export const CHAR_LF = 0xA;
export const CHAR_CR = 0xD;
export const CHAR_TAG_START = 0x3C; // <
export const CHAR_TAG_END = 0x3E; // >
export const CHAR_EQUALITY_SYMBOL = 0x3D; // =
export const CHAR_SINGLE_QUOTE = 0x27; // '
export const CHAR_DOUBLE_QUOTE = 0x22; // "
export const CHAR_OPEN_CURLY = 0x7B; // {
export const CHAR_CLOSE_CURLY = 0x7D; // }
export const CHAR_FORWARD_SLASH = 0x2F; // /
