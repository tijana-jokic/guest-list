const SUPABASE_URL =
"https://gfpedncnslindgfgvhjc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
"sb_publishable_qapJranLnX_q4idtRKgYTg_xIg7Y3Dn";

const supabaseClient =
window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

async function testSupabaseConnection() {
    const { data, error } = await supabaseClient
        .from("guests")
        .select("*");

    if (error) {
        console.error("Greška pri povezivanju:", error);
        return;
    }

    console.log("Uspešno povezivanje sa Supabase bazom!");
    console.log("Gosti iz baze:", data);
}

testSupabaseConnection();


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

const newSearchButton =
    document.getElementById("newSearchButton");


// =========================================================
// FUNKCIJA KOJA PRIKAZUJE PODATKE O GOSTU
// =========================================================

function showGuest(guest) {

    welcomeMessage.textContent =
        "Dobrodošli, " +
        guest.first_name +
        "!";


    tableNumber.textContent =
        guest.table_number;


    // -----------------------------------------
    // Pronađi sve stolove
    // -----------------------------------------

    const tables =
        document.querySelectorAll(".table");


    // -----------------------------------------
    // Ukloni prethodno označavanje
    // -----------------------------------------

    tables.forEach(function(table) {

        table.classList.remove(
            "selected-table"
        );

    });


    // -----------------------------------------
    // Pronađi sto gosta
    // -----------------------------------------

    const selectedTable =
        document.querySelector(
            '.table[data-table="' +
            guest.table_number +
            '"]'
        );


    // -----------------------------------------
    // Označi njegov sto
    // -----------------------------------------

    if (selectedTable) {

        selectedTable.classList.add(
            "selected-table"
        );

    }


    // -----------------------------------------
    // Sakrij početnu karticu
    // -----------------------------------------

    searchCard.style.display =
        "none";


    // -----------------------------------------
    // Prikaži rezultat
    // -----------------------------------------

    resultCard.style.display =
        "block";
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
            data: guests,
            error
        } = await supabaseClient
            .from("guests")
            .select("*");


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


        // -----------------------------------------
        // Traženje gostiju
        // -----------------------------------------

        const matchingGuests =
            guests.filter(function(person) {

                const firstName =
                    normalizeText(
                        person.first_name
                    );

                const lastName =
                    normalizeText(
                        person.last_name
                    );

                const fullName =
                    firstName +
                    " " +
                    lastName;


                return (
                    firstName.includes(search) ||
                    lastName.includes(search) ||
                    fullName.includes(search)
                );

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

            showGuest(
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
                        function() {

                            showGuest(
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