# **Alkitab**
### [Project Demo](https://youtu.be/0GMP3xIboAI)
### [https://www.cscc09-alkitab.ninja/](https://www.cscc09-alkitab.ninja/)

## **Description**
Alkitab is a platform to view, share, discuss, and read e-books. Users can sign up, and browse a catalog of books.

## **Key Features of Beta Version**
- Sign up and sign in
- Users can upload e-books or create their own text-based book
- Voting books on a scale
- Discussion on book page (Threads)
- Deployed on Kubernetes

## **Key Features of Final Version**
- "Screen share" ability for books
- Casters can annotate that page
- Become a Provider that provides access to user's data


## **Challenge Factors**
1. Real-time interaction:
   - Events and podcasts
       - Casters can "screen share" a page of a book
       - Casters can annotate that page
           - for example, highlight a line for everyone to sees
       - A user can create a book/series club and each club has a voice channel which others can join to have a discussion
2. OAuth 2.0:
    We can become a provider where 3rd party applications can access user's data. Examples of data can include:
    - The user's libary of books
    - Their reviews of books
    - Their book lists
    - We can also allow a user to create an account using Google login
3. Scalability
    We are planning on deploying this web app to Kubernetes on AWS. Some K8s technology that can help with scalablity such as
    - Horizontal pod autoscaler
    - Cluster autoscaler

## **Tech Stack**
### **Front End**
* Svelte
* SCSS
* Bootstrap

### **Back End**
* TypeScript
* Express
* Amazon S3
* MongoDB

## **Deployment**
- Docker On AWS
- Kubernetes

## **Team Members**

* [Stephen Guo](https://github.com/Epicsteve2)
* [Andy Yuen](https://github.com/AndyTRY)
* [Mohammad Qadir](https://github.com/DomiVesalius)