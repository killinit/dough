require "spec_helper"

class HelperWrapper
  include Dough::Helpers
end

module Dough
  module Helpers
    describe Renderer, type: :controller do
      render_views


      describe "#inset_block" do
        controller do
          helper Dough::Helpers

          def index
            render(inline: "<%= inset_block 'Some instructional text' %>")
          end
        end

        before :each do
          get :index
        end

        it "has an inset_block class" do
          expect(response.body).to include('class="inset-block"')
        end

        it "has an inset_block content container class" do
          expect(response.body).to include('class="inset-block__content-container"')
        end

        it "has an inset_block text class" do
          expect(response.body).to include('class="inset-block__text"')
        end

      end

      describe "#callout_editorial" do
        controller do
          helper Dough::Helpers

          def index
            render(inline: "<%= callout_editorial 'hello', html_content: {heading: 'Some heading', content: 'Some content' } %>")
          end
        end


        it 'renders "text"' do
          get :index

          expect(response.body).to include('hello')
        end

        it "wraps the text in a div element" do
          get :index

          expect(response.body).to include('<div class="callout-editorial">')
        end

        context "parsing html content" do
          let(:html_content) {
            {
              heading: 'Some heading',
              content: 'Some content'
            }
          }

          it "passed html heading is accessible" do
            get :index

            expect(response.body).to include(html_content[:heading])
          end

          it "passed html content is accessible" do
            get :index

            expect(response.body).to include(html_content[:content])
          end
        end
      end

      describe "#callout_instructional" do
        controller do
          helper Dough::Helpers

          def index
            render(inline: "<%= callout_instructional 'Some instructional text', html_content: { heading: '<h3>Budgeting tips</h3>', content: '<p>In 1985</p>' } %>")
          end
        end

        before :each do
          get :index
        end

        it 'renders the heading' do
          expect(response.body).to include('<h3>Budgeting tips</h3>')
        end

        it 'renders the content' do
          expect(response.body).to include('<p>In 1985</p>')
        end

        it "wraps the text in a div element" do
          expect(response.body).to include('<div class="callout callout--instructional">')
        end
      end

      describe "#tab_selector" do
        let(:tab_selector) {
        }

        controller do
          helper Dough::Helpers

          def index
            render(inline: 
              "<%=
                tab_selector :section_name do |tab|
                  tab.section do |container|
                    container.active
                    container.heading 'Some title'
                    container.content do
                      'Really complex content </br>' 
                    end
                  end
                end
              %>"
            )
          end
        end

        it "has a tab selector" do
          get :index

          expect(response.body).to include('div class="tab-selector"')
        end

        it "creates tab wrappers" do
          get :index

          expect(response.body).to include('div data-dough-tab-selector-triggers-outer class="tab-selector__triggers-outer"')
          expect(response.body).to include('div data-dough-tab-selector-triggers-inner class="tab-selector__triggers-inner"')
        end

        it "sets up the expected amount of tabs" do
          get :index

          expect(response.body).to include('div class="tab-selector__trigger-container is-active"')
        end

        it "creates the expected sections"
        it "indexes each section appropriately"
        it "indexes each tab appropriately"
      end
    end
  end
end
