<script lang="ts">
import { onMount } from "svelte";
import io from "socket.io-client";


import {
    ALKITAB_BACKEND_PORT,
    ALKITAB_BACKEND_URL,
    currentUser,
} from "../stores";


const bookId = "62d427782c9ec7171afeba1d";
let pageNumber = 1;

let promise = getBook(bookId);
async function getBook(bookId: string): Promise<void> {
    console.log(pageNumber);
    console.log(`http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`)
    const response = await self.fetch(
        `http://${ALKITAB_BACKEND_URL}:${ALKITAB_BACKEND_PORT}/api/library/book/${bookId}?page=${pageNumber}&limit=1`,
        {method: "GET"}
    );
    if (response.ok){
        const body = await response.json()
        console.log(body.pages)
        return body.pages
        
    } else {
        throw new Error("error");
    }
    
};

async function getNextPage(): Promise<void>{
    pageNumber += 1;
    promise = getBook(bookId)
}


// SOCKET
const socket = io("http://localhost:3000")
let users = []
socket.on('newUser', (user)=>{
    console.log("ENTERED" + user);
})









</script>


{#await promise}
	<p>...waiting</p>
{:then pages}
<p>{@html pages[0]}</p>
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}

<button class="btn btn-warning " type="button" on:click={getNextPage}>
Next Page</button>