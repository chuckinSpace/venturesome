const test = n => {
	const arraySize = n[0]
	const array = n.splice(0, 1)

	for (let index = 0; index < n.length; index++) {
		if (n[index] === 0) {
			console.log(n[index], index)
			n.splice(n.length / 2, 0, 0)
			n.splice(n[index], 1)

			break
		}
	}
	return n
}

console.log(test([4, 0, 1, 1, 3]))
