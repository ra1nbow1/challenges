declare module '*.scss' {
	const classes: { [key: string]: string }
	export default classes
}

interface ImportMetaEnv {
	readonly VITE_PRODUCTION: string
	readonly VITE_BACKEND_URL: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
