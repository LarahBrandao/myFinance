const Modal = {
    open() {
        //Abrir modal
        // adicionar  a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active')
    },

    close() {
        // fechar o modal
        // remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem('my.finaces:transactions')) || []
    },
    set(transactions) {
        localStorage.setItem("my.finaces:transactions", JSON.stringify(transactions))
    }

}

const Transaction =  {
    all: Storage.get(),
        

    add(transaction) {
        Transaction.all.push(transaction)

        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        // somar as entradas
        let income = 0;

        Transaction.all.forEach( (transaction) => {
            if (transaction.amount > 0) {
                income = income + transaction.amount;
                // income += transaction.amount --- forma resumida
            }
        } )

        return income
    },

    expenses() {
        // somar as saídas
        let expense = 0;

        Transaction.all.forEach( (transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount;
                
            }
        } )

        return expense
    },

    total() {
        // entradas menos saídas
        return Transaction.incomes() + Transaction.expenses();  
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
            .getElementById('expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.expenses())
        document
            .getElementById('totalDisplay')
            .innerHTML = Utils.formatCurrency(Transaction.total())
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML= ""
    }
}

const Utils  = {
    formatAmount(value) {
/*         value = Number(value) * 100
        
        return value */

        value = value * 100
        return Math.round(value)
    },
    formatDate(date) {
        const splitedDate = date.split("-")
        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]}`
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : ""
        
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    },


}

const Form = {

    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },

    validatedFields() {
        const {description, amount, date} = Form.getValues()
        if ( description.trim() === "" || amount.trim() === "" || date.trim() === "" ) {
            throw new Error("Por favor preencha todos os campos")
        }
    },

    formatValues() {
        let {description, amount, date} = Form.getValues()

        amount =  Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },


    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        // tente
        try {
            // validação do form
            Form.validatedFields()
            // formatação do form
            const transaction = Form.formatValues()
            // salvar dados no form
            Transaction.add(transaction)
            // apagar os dados do form
            Form.clearFields()
            // fechar o modal
            Modal.close()
            
        } catch (error) {
            alert(error.message)
        
     }
    }
}


const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction) 
        
        DOM.updateBalance()

        Storage.set(Transaction.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
    }

App.init()
