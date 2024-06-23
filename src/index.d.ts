declare module '*.scss' {
	const classes: { [key: string]: string }
	export default classes
}

interface ImportMetaEnv {
	readonly VITE_PRODUCTION: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
