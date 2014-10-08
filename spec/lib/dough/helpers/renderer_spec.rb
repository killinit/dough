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
            render(inline: "<%= callout_instructional 'Some instructional text', html_content: {
    heading: '<h3>Budgeting tips</h3>',
    content: '<p>In 1985, average first-time buyers needed a deposit of 5% to buy a home - in 2012, this had increased to 20%
    <br/><strong>Source: HM Treasury </strong>
      </p>'
} %>")
          end
        end

        before :each do
          get :index
        end

        it 'renders "text"' do
          expect(response.body).to include('Budgeting tips')
        end

        it "wraps the text in a div element" do
          expect(response.body).to include('<div class="callout callout--instructional">')
        end
      end
    end
  end
end
