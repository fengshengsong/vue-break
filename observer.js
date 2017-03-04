
// 在文档片段中操作减少DOM操作
function node2Fragment(node,vm){
    var fragment = document.createDocumentFragment();
    var child;
    while(child = node.firstChild){
        compile(child,vm);
        fragment.append(child);
    }
    return fragment;
}

function compile(node,vm){
    var reg = /\{\{(.*)\}\}/;
    // 元素节点
    if(node.nodeType === 1){
        // 元素节点的属性节点
        var attrNodes = Array.from(node.attributes);
        attrNodes.map(function(attrNode,index){
            if(attrNode.nodeName == 'v-model'){
                var value = attrNode.nodeValue;
                node.addEventListener('input',function(e){
                    vm[value] = e.target.value;
                });
                node.value = vm[value];
                node.removeAttribute('v-model');
            }  
        });
    }
    // 文本节点
    if(node.nodeType === 3){
        if(reg.test(node.nodeValue)){
            // 与正则表达式匹配的第一个子匹配字符串
            var value = RegExp.$1;
            value = value.trim();
            // node.nodeValue = vm[value];
            new Watcher(vm,node,value);
        }
    }
}

function VueBreak(options){
    var vm = this;
    vm.data = options.data;
    var data = vm.data;
    // 监听数据
    observe(data,vm);
    var id = options.el;
    // 编译DOM
    var dom = node2Fragment(document.getElementById(id),vm);
    document.getElementById(id).append(dom);
}

function defineReactive(obj,key,val){
    var dep = new Dep();
    Object.defineProperty(obj,key,{
        configurable:true,
        enumerable:true,
        get:function(){
            if(Dep.target){
                dep.addSub(Dep.target);
            }
            return val;
        },
        set:function(newVal){
            if(newVal === val){
                return;
            }
            val = newVal;
            dep.notify();
        }
    });
}

function observe(obj,vm){
    // 将obj中属性注册到vm实例中
    Object.keys(obj).forEach(function(key){
        defineReactive(vm,key,obj[key]);
    });
}


function Dep(){
    this.subs = [];
}

Dep.prototype = {
    addSub:function(sub){
        this.subs.push(sub);
    },
    notify:function(){
        this.subs.forEach(function(sub){
            sub.update();
        });
    }
};

function Watcher(vm,node,name){
    Dep.target = this,
    this.name = name;
    this.node = node;
    this.vm = vm;
    this.update();
    Dep.target = null;
}

Watcher.prototype = {
    update:function(){
        this.get();
        this.node.nodeValue = this.value;
    },
    get:function(){
        this.value = this.vm[this.name];
    }
};