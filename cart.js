import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';

// 表單驗證，把全部規則載進來
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
      VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
  });
  // 讀取外部的資源
  VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
  // Activate the locale
  VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
  });

const apiUrl = 'https://vue3-course-api.hexschool.io/v2/';
const apiPath = 'tongxiu28';

const productModal = {
    //當id變動時，取得遠端資料，並呈現Modal
    props:['id','addToCart','openModal'],
    data() {
        return {
            modal:{},
            tempProduct: { },
            qty: 1,
        };
    },
    template:'#userProductModal',
    watch:{
        id(){
            console.log('productModal:',this.id);
            if (this.id){
                 axios.get(`${apiUrl}api/${apiPath}/product/${this.id}`)
            .then( res => {
                // console.log( '單一產品:', res.data.product);
                this.tempProduct = res.data.product;
                this.modal.show();
            });
            }
        },
    },
    methods:{
        hide(){
            this.modal.hide();
        }
    },
    mounted( ){
        this.modal = new bootstrap.Modal(this.$refs.modal);
        //監聽DOM 當Modale關閉時...要做其他事情
        this.$refs.modal.addEventListener('hidden.bs.modal', event => {
            // console.log('Modal被關閉了');
            this.openModal('');
            // do something...
          })
    },
};

const app = Vue.createApp({
    data( ){
        return{
            products:[ ],
            productId: '',
            cart: {},
            loadingItem: '', //存ID
            form:{
                user: {
                  name: '',
                  email: '',
                  tel: '',
                  address: '',
                },
                message: '',
              },
        };
    },
    methods:{
        getProducts( ){
            axios.get(`${apiUrl}api/${apiPath}/products/all`)
            .then( res => {
                // console.log( '產品列表:', res.data.products);
                this.products = res.data.products;
            })
            .catch(err => alert('請重新讀取'));
        },
        openModal(id){
            this.productId = id;
            // console.log("外層帶入 productID:", id);
        },
        addToCart(product_id, qty = 1) { // 當沒有傳入該參數時，會使用預設值
            const data = {
                product_id,
                qty,
            };
            axios.post(`${apiUrl}api/${apiPath}/cart`,{ data })
            .then( res => {
                // console.log( '加入購物車:', res.data);
                this.$refs.productModal.hide();
                this.getCarts();
            })
            .catch(err => alert('請重新加入'));
        },
        getCarts( ){
            axios.get(`${apiUrl}api/${apiPath}/cart`)
            .then( res => {
                // console.log( '購物車:', res.data);
                this.cart = res.data.data;
            })
            .catch(err => alert(err.res.data.message));
        },
        updataCartItem(item){ // 購物車的ID ,產品的ID
            const data = {
                    product_id: item.product.id,
                    qty: item.qty,
                };
                this.loadingItem = item.id;
            axios.put(`${apiUrl}api/${apiPath}/cart/${item.id}`,{data})
            .then( res => {
                // console.log( '更新購物車:', res.data);
                this.getCarts();
                this.loadingItem = ' ';
            })
            .catch(err => alert('變更失敗，在試一次'));
        },
        deleteItem(item){ // 購物車的ID ,產品的ID
            this.loadingItem = item.id;
            axios.delete(`${apiUrl}api/${apiPath}/cart/${item.id}`)
            .then( res => {
                // console.log( '刪除購物車:', res.data);
                this.getCarts();
                this.loadingItem = ' ';
            })
            .catch(err => alert('刪除失敗'));
        },
        onSubmit(){
            const order = this.form;
            axios.post(`${apiUrl}/v2/api/${apiPath}/order`, { order })
            .then(res => {
                this.getCarts();
                alert(res.data.message);
                this.$refs.form.resetForm();
            })
            .catch(err => alert(err.res.data.message));;
        }  
    },
    components: {
        productModal,
    },
    mounted( ){
        this.getProducts( );
        this.getCarts();
    }
});

// 表單驗證元件(全域註冊)
app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');