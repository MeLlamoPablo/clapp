# Changelog

* v1.2.1
	* Fixed numbers exceeding `Number.MAX_SAFE_INTEGER` losing precision even if treated as strings
	(see [issue](https://github.com/MeLlamoPablo/clapp/issues/7)).
* v1.2.0
	* Added option `caseSensitive` with default value `true` to: {@link App}, {@link Command} and
	{@link Flag}.
* v1.1.1
	* Minor fix when generating App help. See
	[issue](https://github.com/MeLlamoPablo/clapp/issues/1#issuecomment-265963359).
* v1.1.0
	* Added {@link Argument} and {@link Flag}. Deprecated declaring args and flags with objects, 
    though it still works.
	* Commands must now have a description.
	* Flags now must have a default value.
	* Added support for [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Deprecated `async` attribute.
* v1.0.1
	* Minor bug fix.
* v1.0.0
	* See [v1-changes](https://mellamopablo.github.io/clapp/clapp/1.0.1/tutorial-v1-changes.html).
