// Export the formatDate function so it can be imported elsewhere
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
	const date = new Date(dateString);
	const defaultOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
	return date.toLocaleDateString('en-US', options || defaultOptions);
}

const blogDate = formatDate('2025-08-24'); 
console.log(blogDate); // Output: "Aug 24, 2025"

const chartMonth = formatDate('2025-08-24', { month: 'short', year: 'numeric' }); 
console.log(chartMonth); // Output: "Aug 2025"
