<<<<<<< HEAD
=======
import iconFont from './iconFont'
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
const modules = import.meta.globEager('./*.vue')
const map = {}
Object.keys(modules).forEach(file => {
  const modulesName = file.replace('./', '').replace('.vue', '')
  map[modulesName] = modules[file].default
})
const globalComponents = {
  ...map,
<<<<<<< HEAD
=======
  iconFont,
>>>>>>> afb34d7396377e691502cb3912eb4d629066071c
}
export default globalComponents
