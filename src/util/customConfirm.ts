export default (phrase: string, action: () => void) => {
    if (window.confirm(`Are you sure you want to ${phrase}?`)){
        action();
    }
}