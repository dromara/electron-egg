package router

func Init() {
	// 设置静态资源
	//setStatic()

	Api()
}

// func setStatic() {
// 	// 使用embed打包静态资源至二进制文件中
// 	fsys, _ := fs.Sub(static.Static, "static")
// 	fileServer := http.FileServer(http.FS(fsys))
// 	handler := WrapStaticHandler(fileServer)
// 	router.GET("/", handler)
// 	router.GET("/favicon.ico", handler)
// 	router.GET("/config.js", handler)
// 	// 所有/assets/**开头的都是静态资源文件
// 	router.GET("/assets/*file", handler)

// }

// func WrapStaticHandler(h http.Handler) gin.HandlerFunc {
// 	return func(c *gin.Context) {
// 		c.Writer.Header().Set("Cache-Control", `public, max-age=31536000`)
// 		h.ServeHTTP(c.Writer, c.Request)
// 	}
// }
