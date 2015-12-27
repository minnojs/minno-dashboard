### RESTfull API
Read about the [RESTfull API](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api). It will be worth your time...

### Files (directory/study?)
A representation of a directory/study. Manages lists of files. Currently we're not trying to manage studies using this interface so all we need it the GET method.

#####    GET     /files/:directoryId - retrieve a file (plain text)

Returns a JSON with the following stucture:

```js
{
    files: [
        {id:'#hash', url:'full path to file', isDir:false},
        {id:'#hash', url:'full path to file', isDir:false},
        {id:'#hash', url:'full path to file', isDir:false},
    ]
}
```

We can eventually add some meta data in here such as owner, parent project etc.

### File
A representation of a single file.

#####    GET     /files/:directoryId/file/:fileId - retrieve a file
Returns a file object:

```js
{
    id: '#hash',
    url:'full path to file',
    content: 'Text file content'
}
```

It may leave content empty if the file is binary.

#####    POST    /files/:directoryId/file/ - create a file
Creates a file for this directoryId.
Returns a full file object.

#####    PUT     /files/:directoryId/file/:fileId - update a file
Update an existing file.
Returns a full file object.

#####    DELETE  /files/:directoryId/file/:fileId - delete a file
Delete an existing file.
Returns empty body (and appropriate http status!).

### Errors
Error Should respond with the appropriate [HTTP status codes](https://en.wikipedia.org/wiki/List_of_HTTP_status_codes) (i.e. 404 not found, 403 auth etc.).
The body of the response should include valid JSON including at least the field "message" with a description of the error.

```js
{
    "message": "This is an error. So sad :("
}
```