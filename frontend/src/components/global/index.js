const modules = import.meta.glob('./*.vue', { eager: true })
const map = {}
Object.keys(modules).forEach(file => {
  const modulesName = file.replace('./', '').replace('.vue', '')
  map[modulesName] = modules[file].default
})
const globalComponents = {
  ...map,
}
export default globalComponents
