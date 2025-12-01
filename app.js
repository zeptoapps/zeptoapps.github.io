document.addEventListener("DOMContentLoaded", () => {
    // global variables
    let form = document.querySelector(".template-form");
    let textarea = document.querySelector(".editor-textarea");
    let select = document.querySelector("#select-template");
    let feedback = document.querySelector(".feedback");
    textarea.value = "";
    // show feedback to the user
    function showFeedback(className, message) {
      feedback.classList.add(className);
      feedback.textContent = message;
      feedback.style.display = "block";
      setTimeout(function () {
        feedback.classList.remove(className);
        feedback.style.display = "none";
      }, 6000);
    }
  
    // generator function
    function generator(template, name) {
      template.value = textarea.value.toString();
      let value = template.value;
      let regex = template.search;
      let replace = template.replace;
  
      // check if its a valid template
      if (value.match(regex) != null) {
        let replaced = value.replace(regex, replace);
        textarea.value = replaced;
        showFeedback(
          "alert-success",
          "✌ Sucessfully added Product Personalizer code"
        );
      } else {
        showFeedback("alert-danger", `😞 Sorry, not a ${name} template`);
      }
    }
  
    // Data store
    let state = {
      // order confirmation
      orderConfirmation: {
        value: ``,
        search:
          /{%\s*if\s+line\.variant\.title\s*!=\s*'Default\s+Title'\s+and\s+is_parent\s*==\s*false\s*%}(?:\s*<span\s+class="order-list__item-variant">\s*{{\s*line\.variant\.title\s*}}\s*<\/span>\s*<br\/>\s*)?{%\s*elsif\s+line\.variant\.title\s*!=\s*'Default\s+Title'\s+and\s+line\.nested_line_parent\?\s*%}(?:\s*<span\s+class="order-list__item-variant">\s*{{\s*line\.variant\.title\s*}}\s*<\/span>\s*<br\/>\s*)?{%\s*elsif\s+line\.variant\.title\s*!=\s*'Default\s+Title'\s+and\s+line\.bundle_parent\?\s+and\s+false\s*==\s*false\s*%}(?:\s*<span\s+class="order-list__item-variant">\s*{{\s*line\.variant\.title\s*}}\s*<\/span>\s*<br\/>\s*)?{%\s*endif\s*%}/gim,
        replace: `
        {% if line.variant.title != 'Default Title' %}
          <span class="order-list__item-variant">{{ line.variant.title }}
          </span>
          <br/>
        {% endif %}
  
        {% for p in line.properties %}   
        {% assign hidden_property = p.first | first | replace: '_', true %}
        {% unless p.last == blank %} 
        {% if p.first contains 'pdf' %}
        {% assign hidden_property = false%}
        {% assign p.first = p.first | replace: '_' %}
        {% endif %} 
        {% if hidden_property == 'true' %} 
        <span style="display:none;" class="product-personalizer-line-item-prop" data-prop-name="{{ p.first }}">{{ p.first }}: {{ p.last }}
        </span> 
        {% else %} 
        {{ p.first | replace: '_'}}: 
        {% if p.last contains '/uploads/' or p.last contains '/assets/' or p.last contains '/products/' %} 
        {% assign format = 'jpg' %}
        {% if p.last contains 'png' %}
        {% assign format = 'png' %}
        {% endif %}
        {% if p.last contains 'pdf' %}
        {% assign format = 'pdf' %}
        {% endif %}
        <a target="_blank"  href="{{ p.last }}?format={{ format }}" src="{{ p.last }}?format={{ format }}" class="jslghtbx-thmb" data-jslghtbx download>Download {{ format }} file
        </a> 
        {% else %} 
        {{ p.last | newline_to_br }} 
        {% endif %} 
        <br> 
        {% endif %} 
        {% endunless %}
        {% endfor %}
        `,
      },
      // packing slip
      packingSlip: {
        value: ``,
        search:
          /{% if line_item\.sku != blank %}\s*<span class="line-item-description-line">\s*{{ line_item\.sku }}\s*<\/span>\s*{% endif %}/gim,
        replace: `
          {% if line_item.sku != blank %}
          <span class="line-item-description-line">
            {{ line_item.sku }}
          </span>
          {% endif %}
          
          {% for p in line_item.properties %}
          {% assign hidden_property = p.first | first | replace: '_', true %}
          {% unless p.last == blank %}
          {% if hidden_property == 'true' %}
          {% else %}
          {{ p.first }}:
          {% if p.last contains '/uploads/' or p.last contains '/assets/' or p.last contains '/products/' %}
          <img style="width:50px;height:auto" src="{{ p.last }}"/>{% else %}{{ p.last | newline_to_br }}
          {% endif %}  
          <br> 
          {% endif %}
          {% endunless %}
          {% endfor %}
        `,
      },
      // fulfilment template
      fulfilment: {
        value: ``,
        search: /<p>\s*Variant Title:\s*{{ line\.line_item\.title }}\s*<\/p>/gim,
        replace: `
        <p>Variant Title: {{ line.line_item.title }}</p>
        {% for p in line.line_item.properties %}   
        {% assign hidden_property = p.first | first | replace: '_', true %}
        {% unless p.last == blank %} 
        {% if p.first contains 'pdf' %}
        {% assign hidden_property = false%}
        {% assign p.first = p.first | replace: '_' %}
        {% endif %} 
        {% if hidden_property == 'true' %} 
        <span style="display:none;" class="product-personalizer-line-item-prop" data-prop-name="{{ p.first }}">{{ p.first }}: {{ p.last }}
        </span> 
        {% else %} 
        {{ p.first | replace: '_'}}: 
        {% if p.last contains '/uploads/' or p.last contains '/assets/' or p.last contains '/products/' %} 
        {% assign format = 'jpg' %}
        {% if p.last contains 'png' %}
        {% assign format = 'png' %}
        {% endif %}
        {% if p.last contains 'pdf' %}
        {% assign format = 'pdf' %}
        {% endif %}
        <a target="_blank"  href="{{ p.last }}?format={{ format }}" src="{{ p.last }}?format={{ format }}" class="jslghtbx-thmb" data-jslghtbx download>Download {{ format }} file
        </a> 
        {% else %} 
        {{ p.last | newline_to_br }} 
        {% endif %} 
        <br> 
        {% endif %} 
        {% endunless %}
        {% endfor %}
        `,
      },
      // New order confirmation
      newOrderConfirmation: {
        value: ``,
        search:
          /{% if line\.variant\.title != 'Default Title' and line\.bundle_parent\? == false %}\s*<span class="order-list__item-variant">\s*{{ line\.variant\.title }}\s*<\/span>\s*(?:\n\s*{% if line\.sku != blank %}\s*<span class="order-list__item-variant">• \s*<\/span>\s*{% endif %})?\s*{% elsif line\.variant\.title != 'Default Title' and line\.bundle_parent\? and expand_bundles == false %}\s*<span class="order-list__item-variant">\s*{{ line\.variant\.title }}\s*<\/span>\s*(?:\n\s*{% if line\.sku != blank %}\s*<span class="order-list__item-variant">• \s*<\/span>\s*{% endif %})?\s*{% endif %}\s*(?:\n\s*{% if line\.sku != blank %}\s*<span class="order-list__item-variant">SKU:\s*{{ line\.sku }}<\/span>\s*{% endif %})?/gim,
        replace: `
        {% if line.variant.title != 'Default Title' %}
        <span class="order-list__item-variant">{{ line.variant.title }}
        </span>
        {% if line.sku != blank %}
        <span class="order-list__item-variant">• 
        </span>
        {% endif %}
        {% endif %}
        {% for p in line.properties %}   
        {% assign hidden_property = p.first | first | replace: '_', true %}
        {% unless p.last == blank %} 
        {% if p.first contains 'pdf' %}
        {% assign hidden_property = false%}
        {% assign p.first = p.first | replace: '_' %}
        {% endif %} 
        {% if hidden_property == 'true' %} 
        <span style="display:none;" class="product-personalizer-line-item-prop" data-prop-name="{{ p.first }}">{{ p.first }}: {{ p.last }}
        </span> 
        {% else %} 
        {{ p.first | replace: '_'}}: 
        {% if p.last contains '/uploads/' or p.last contains '/assets/' or p.last contains '/products/' %} 
        {% assign format = 'jpg' %}
        {% if p.last contains 'png' %}
        {% assign format = 'png' %}
        {% endif %}
        {% if p.last contains 'pdf' %}
        {% assign format = 'pdf' %}
        {% endif %}
        <a target="_blank"  href="{{ p.last }}?format={{ format }}" src="{{ p.last }}?format={{ format }}" class="jslghtbx-thmb" data-jslghtbx download>Download {{ format }} file
        </a> 
        {% else %} 
        {{ p.last | newline_to_br }} 
        {% endif %} 
        <br> 
        {% endif %} 
        {% endunless %}
        {% endfor %}
        `,
      },
      shippingConfirmation: {
        value: ``,
        search:
          /{%\s*if\s+line\.line_item\.variant\.title\s*!=\s*'Default\s+Title'\s+and\s+is_parent\s*==\s*false\s*%}\s*<span\s+class="order-list__item-variant">\s*{{\s*line\.line_item\.variant\.title\s*}}\s*<\/span>\s*<br\s*\/>/gim,
        replace: `
        {% if line.line_item.variant.title != 'Default Title' %}
          <span class="order-list__item-variant">{{ line.line_item.variant.title }}</span><br/>
        
  
        {% for p in line.line_item.properties %}   
          {% assign hidden_property = p.first | first | replace: '_', true %}
          {% unless p.last == blank %} 
          {% if p.first contains 'pdf' %}
          {% assign hidden_property = false%}
          {% assign p.first = p.first | replace: '_' %}
          {% endif %} 
          {% if hidden_property == 'true' %} 
          <span style="display:none;" class="product-personalizer-line-item-prop" data-prop-name="{{ p.first }}">{{ p.first }}: {{ p.last }}
          </span> 
          {% else %} 
          {{ p.first | replace: '_'}}: 
          {% if p.last contains '/uploads/' or p.last contains '/assets/' or p.last contains '/products/' %} 
          {% assign format = 'jpg' %}
          {% if p.last contains 'png' %}
          {% assign format = 'png' %}
          {% endif %}
          {% if p.last contains 'pdf' %}
          {% assign format = 'pdf' %}
          {% endif %}
          <a target="_blank"  href="{{ p.last }}?format={{ format }}" src="{{ p.last }}?format={{ format }}" class="jslghtbx-thmb" data-jslghtbx download>Download {{ format }} file
          </a> 
          {% else %} 
          {{ p.last | newline_to_br }} 
          {% endif %} 
          <br> 
          {% endif %} 
          {% endunless %}
        {% endfor %}
        `,
      },
    };
  
    // Check when the form is submitted
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      // check if the textarea value is empty
      if (textarea.value !== "") {
        // order confirmation
        if (select.value == "order-confirmation") {
          generator(state.orderConfirmation, "order confirmation");
        }
        // new order confirmation
        if (select.value == "new-order-confirmation") {
          generator(state.newOrderConfirmation, "new order confirmation");
        }
        // packing slip
        if (select.value == "packing-slip") {
          generator(state.packingSlip, "packing slip");
        }
        // fulfillment confirmation
        if (select.value == "fulfillment-confirmation") {
          generator(state.fulfilment, "fulfilment");
        }
        // shipping confirmation
        if (select.value == "shipping-confirmation") {
          generator(state.shippingConfirmation, "shipping confirmation");
        }
      } else {
        showFeedback("alert-danger", "Please paste your template.");
      }
    });
  });
