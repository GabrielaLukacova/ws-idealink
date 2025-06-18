export function createNewBoard(router) {
    const id = Math.random().toString(36).substring(2, 8)
    router.push(`/${id}`)
  }
  
  export function copyLink() {
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert('Board link copied to clipboard!')
    })
  }