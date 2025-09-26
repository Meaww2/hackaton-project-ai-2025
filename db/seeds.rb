# frozen_string_literal: true

products = [
  { sku: 'PEN-001', name: 'Gel Pens Blue', unit: 'box', reorder_level: 12, stock_on_hand: 5 },
  { sku: 'PEN-002', name: 'Gel Pens Black', unit: 'box', reorder_level: 12, stock_on_hand: 18 },
  { sku: 'NTBK-001', name: 'A5 Notebooks', unit: 'pack', reorder_level: 15, stock_on_hand: 4 },
  { sku: 'NTBK-002', name: 'A4 Notebooks', unit: 'pack', reorder_level: 20, stock_on_hand: 22 },
  { sku: 'ENV-001', name: 'DL Envelopes', unit: 'box', reorder_level: 10, stock_on_hand: 3 },
  { sku: 'ENV-002', name: 'C4 Envelopes', unit: 'box', reorder_level: 8, stock_on_hand: 12 },
  { sku: 'INK-001', name: 'Ink Cartridge Black', unit: 'unit', reorder_level: 6, stock_on_hand: 2 },
  { sku: 'INK-002', name: 'Ink Cartridge Color', unit: 'unit', reorder_level: 6, stock_on_hand: 7 },
  { sku: 'PAPR-001', name: 'Printer Paper A4', unit: 'ream', reorder_level: 30, stock_on_hand: 28 },
  { sku: 'PAPR-002', name: 'Printer Paper A3', unit: 'ream', reorder_level: 20, stock_on_hand: 9 },
  { sku: 'STAP-001', name: 'Standard Staples', unit: 'box', reorder_level: 25, stock_on_hand: 40 },
  { sku: 'TAPE-001', name: 'Packing Tape', unit: 'roll', reorder_level: 12, stock_on_hand: 6 }
]

def build_seed_movements_for(product, target_stock)
  now = Time.zone.now
  movement_entries = []

  opening_in = target_stock + rand(5..12)
  movement_entries << { kind: 'IN', quantity: opening_in, reference: 'seed-initial' }
  current_stock = opening_in

  if current_stock > target_stock
    potential_out = [current_stock - target_stock, rand(2..8)].min
    movement_entries << { kind: 'OUT', quantity: potential_out, reference: 'seed-adjust' }
    current_stock -= potential_out
  end

  if current_stock < target_stock
    replenishment = target_stock - current_stock
    movement_entries << { kind: 'IN', quantity: replenishment, reference: 'seed-topup' }
    current_stock += replenishment
  elsif current_stock > target_stock
    final_out = current_stock - target_stock
    movement_entries << { kind: 'OUT', quantity: final_out, reference: 'seed-balance' }
    current_stock -= final_out
  end

  raise 'Seed movements did not balance' unless current_stock == target_stock

  movement_entries.each_with_index do |entry, index|
    moved_at = now - rand(0..13).days - rand(0..23).hours - rand(0..59).minutes
    creator = StockMovements::Creator.new(
      product: product,
      params: entry.merge(moved_at: moved_at)
    )
    unless creator.call
      puts "Failed to create seed movement for #{product.sku}: #{creator.movement.errors.full_messages.join(', ')}"
    end
  end
end

products.each do |attrs|
  target_stock = attrs[:stock_on_hand]
  product = Product.find_or_initialize_by(sku: attrs[:sku])
  product.assign_attributes(attrs.merge(stock_on_hand: 0))
  product.save!

  build_seed_movements_for(product, target_stock)
end

def seed_user(email, password, role)
  user = User.find_or_initialize_by(email: email)
  user.password = password
  user.password_confirmation = password
  user.save!
  user.add_role(role)
end

seed_user('manager@example.com', 'Password123!', :manager)
seed_user('officer@example.com', 'Password123!', :inventory_officer)
seed_user('viewer@example.com', 'Password123!', :viewer)
