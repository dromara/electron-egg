import iconFont from './iconFont'
const modules = import.meta.globEager('./*.vue')
const map = {}
Object.keys(modules).forEach(file => {
  const modulesName = file.replace('./', '').replace('.vue', '')
  map[modulesName] = modules[file].default
})
const globalComponents = {
  ...map,
  iconFont,
}
export default globalComponents
