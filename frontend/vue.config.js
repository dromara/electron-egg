module.exports = {
    //Solution For Issue:You are using the runtime-only build of Vue where the template compiler is not available. Either pre-compile the templates into render functions, or use the compiler-included build.
    //zhengkai.blog.csdn.net
    runtimeCompiler: true,
    configureWebpack: (config) => {
      config["performance"] = {
        "maxEntrypointSize": 10000000,
        "maxAssetSize": 30000000,
      }
    }
  }