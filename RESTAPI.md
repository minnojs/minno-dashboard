### RESTfull API
Read about the [RESTfull API](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api). It will be worth your time...

### Studies
A representations of the whole study list

#####    GET     /studies/ - retrieve a list studies
Returns a json with all the studies for the current logged in user.

```js
[
    {id:'#hash',name:'study name (human readable)'},
    {id:'#hash',name:'study name (human readable)'},
    {id:'#hash',name:'study name (human readable)'},
    {id:'#hash',name:'study name (human readable)'}
]
```

#####    GET     /studies/:userId - retrieve a list studies
Returns a json with all the studies for the user signified by :userId.

### Files (directory/study?)
A representation of a directory/study. Manages lists of files. Currently we're not trying to manage studies using this interface so all we need it the GET method.

#####    GET     /files/:studyId - retrieve a file

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

#####    GET     /files/:studyId/file/:fileId - retrieve a file
Returns a file object:

```js
{
    id: '#hash',
    url:'full path to file',
    content: 'Text file content'
}
```

It may leave content empty if the file is binary.

#####    POST    /files/:studyId/file/ - create a file
Creates a file for this studyId.

Takes the following parameters:
```
// basic use
{
    name: 'fileName.js',
    content: 'some text'
}
```

```
// allow uploading files eventually
{
    files: [
        uploadedFile,
        uploadedFile,
        uploadedFile
    ]
}
```

Returns a file object:

```js
{
    id: '#hash',
    url:'full path to file'
}
```

#####    PUT     /files/:studyId/file/:fileId - update a file
Update an existing file.
Takes the following parameters:
```
{
    content: 'content'
}
```

Returns empty body (and appropriate http status!).

#####    DELETE  /files/:studyId/file/:fileId - delete a file
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