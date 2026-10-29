const SUPABASE_URL =
"https://gfpedncnslindgfgvhjc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_qapJranLnX_q4idtRKgYTg_xIg7Y3Dn";

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);




// =========================================================
// FUNKCIJA ZA NORMALIZACIJU TEKSTA
// =========================================================

function normalizeText(text) {

    return text
        .trim()
        .toLowerCase()
        .replace(/č/g, "c")
        .replace(/ć/g, "c")
        .replace(/š/g, "s")
        .replace(/ž/g, "z")
        .replace(/đ/g, "dj");
}


// =========================================================
// ELEMENTI SA HTML STRANICE
// =========================================================

const guestForm =
    document.getElementById("guestForm");

const guestName =
    document.getElementById("guestName");

const result =
    document.getElementById("result");

const searchCard =
    document.getElementById("searchCard");

const resultCard =
    document.getElementById("resultCard");

const welcomeMessage =
    document.getElementById("welcomeMessage");

const tableNumber =
    document.getElementById("tableNumber");

const tableGuests =
    document.getElementById("tableGuests");

const newSearchButton =
    document.getElementById("newSearchButton");

    let currentSearchResults = [];


// =========================================================
// FUNKCIJA KOJA PRIKAZUJE PODATKE O GOSTU
// =========================================================


async function showGuest(guest) {
    welcomeMessage.textContent =
        "Dobrodošli, " + guest.first_name + "!";

    tableNumber.textContent = guest.table_number ?? "Nije dodeljen";

    // Ukloni prethodno označavanje stolova
    const tables = document.querySelectorAll(".table");

    tables.forEach(function(table) {
        table.classList.remove("selected-table");
    });

    // Pronađi i označi sto gosta
    const selectedTable = document.querySelector(
        '.table[data-table="' + guest.table_number + '"]'
    );

    if (selectedTable) {
        selectedTable.classList.add("selected-table");
    }

    // Prikaži rezultat i sakrij pretragu
    searchCard.style.display = "none";
    resultCard.style.display = "block";

    // Očisti spisak od prethodnog gosta
    tableGuests.replaceChildren();

    if (guest.table_number == null) {
        tableGuests.textContent =
            "Za ovog gosta još nije dodeljen sto.";
        return;
    }

    // Učitaj goste koji sede za istim stolom
    const guestsAtTable = currentSearchResults.filter(
        function(person) {
            return String(person.table_number) ===
                String(guest.table_number);
        }
    );
    
    const otherGuests = guestsAtTable.filter(
        function(person) {
            return String(person.id) !== String(guest.id);
        }
    );
    
    if (otherGuests.length === 0) {
        tableGuests.textContent =
            "Za sada nema drugih gostiju prikazanih za ovim stolom.";
        return;
    }
    
    otherGuests.forEach(function(person) {
        const guestItem = document.createElement("div");
        guestItem.className = "table-guest";
    
        guestItem.textContent =
            [person.first_name, person.last_name]
                .filter(Boolean)
                .join(" ");
    
        tableGuests.appendChild(guestItem);
    });
}



// =========================================================
// PRETRAGA GOSTA
// =========================================================

guestForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();

        result.replaceChildren();


        const searchValue =
            guestName.value;

        const search =
            normalizeText(searchValue);


        // -----------------------------------------
        // Ako je polje prazno
        // -----------------------------------------

        if (search === "") {

            result.textContent =
                "Unesite ime ili prezime.";

            return;
        }


        // -----------------------------------------
        // Uzimamo sve goste iz Supabase baze
        // -----------------------------------------

        const {
            data: response,
            error
        } = await supabaseClient.functions.invoke(
            "guest-search",
            {
                body: {
                    search_term: searchValue
                }
            }
        );


        // -----------------------------------------
        // Ako postoji greška
        // -----------------------------------------

        if (error) {

            console.error(
                "Greška pri učitavanju gostiju:",
                error
            );

            result.textContent =
                "Došlo je do greške. Pokušajte ponovo.";

            return;
        }

        currentSearchResults = response?.guests || [];


        // -----------------------------------------
        // Traženje gostiju
        // -----------------------------------------

        currentSearchResults = response?.guests || [];

        const matchingGuests =
            currentSearchResults.filter(function(person) {
                return person.is_match;
            });


        // -----------------------------------------
        // Nema rezultata
        // -----------------------------------------

        if (
            matchingGuests.length === 0
        ) {

            result.textContent =
                "Gost nije pronađen.";

        }


        // -----------------------------------------
        // Pronađen je samo jedan gost
        // -----------------------------------------

        else if (
            matchingGuests.length === 1
        ) {

            await showGuest(
                matchingGuests[0]
            );

        }


        // -----------------------------------------
        // Pronađeno je više gostiju
        // -----------------------------------------

        else {

            const message =
                document.createElement("p");

            message.textContent =
                "Pronađeno je više gostiju. Izaberite svoje ime:";

            result.appendChild(message);


            matchingGuests.forEach(
                function(guest) {

                    const button =
                        document.createElement(
                            "button"
                        );

                    button.type =
                        "button";

                    button.className =
                        "guest-option";

                    button.textContent =
                        guest.first_name +
                        " " +
                        guest.last_name;


                    button.addEventListener(
                        "click",
                        async function() {

                            await showGuest(
                                guest
                            );

                        }
                    );


                    result.appendChild(
                        button
                    );

                }
            );

        }

    }
);


// =========================================================
// DUGME "NOVA PRETRAGA"
// =========================================================

newSearchButton.addEventListener(
    "click",
    function() {

        resultCard.style.display =
            "none";


        searchCard.style.display =
            "block";


        guestName.value =
            "";


        guestName.focus();

    }
);