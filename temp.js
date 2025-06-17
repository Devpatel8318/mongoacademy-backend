/*
QUESTION 1: Basic Single Document Delete
Delete the employee with employeeId equal to 3.
*/

/*
QUESTION 2: Delete by String Field
Delete the employee named "Frank Miller".
*/

/*
QUESTION 3: Delete by Status
Delete all employees with status "inactive".
*/

/*
QUESTION 4: Delete by Department
Delete all employees from the "Operations" department.
*/

/*
QUESTION 5: Delete by Salary Range
Delete all employees with salary less than 50000.
*/

/*
QUESTION 6: Delete by Age Condition
Delete all employees who are older than 40 years.
*/

/*
QUESTION 7: Delete by Location
Delete all employees located in "Texas".
*/

/*
QUESTION 8: Delete by Multiple Conditions (AND)
Delete employees who work in "Marketing" department AND have salary less than 60000.
*/

/*
QUESTION 9: Delete by Array Field
Delete all employees who have "SEO" in their skills array.
*/

/*
QUESTION 10: Delete by Date Range
Delete all employees hired before January 1, 2020.
*/

// ================================
// SOLUTION HINTS
// ================================

/*
Remember MongoDB delete operations:
- deleteOne(): Deletes the first document that matches the filter
- deleteMany(): Deletes all documents that match the filter
- Use appropriate operators like $lt, $gt, $in, $and, $or as needed
- For date comparisons, use new Date() or ISODate()
- For array fields, MongoDB automatically searches within arrays
*/
