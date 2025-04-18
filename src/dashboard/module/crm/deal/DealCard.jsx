import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Tooltip, Avatar, Dropdown, Typography, Progress, Empty, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiMenu,
  FiFlag,
  FiDatabase,
  FiTag,
  FiTarget,
  FiLock,
  FiMove,
  FiPlus
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useGetDealsQuery, useUpdateDealMutation, useDeleteDealMutation } from "./services/dealApi";
import { useGetLeadStagesQuery, useUpdateLeadStageMutation } from "../crmsystem/leadstage/services/leadStageApi";
import { useGetPipelinesQuery } from "../crmsystem/pipeline/services/pipelineApi";
import { useGetLabelsQuery, useGetSourcesQuery, useGetCategoriesQuery, useGetStatusesQuery } from "../crmsystem/souce/services/SourceApi";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { setStageOrder, selectDealStageOrder } from './services/DealStageSlice';
import {
  DndContext,
  useDraggable,
  useDroppable,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from '@dnd-kit/utilities';
import { useGetAllCurrenciesQuery } from "../../settings/services/settingsApi";
import { createPortal } from 'react-dom';
import AddLeadStageModal from "../crmsystem/leadstage/AddLeadStageModal";

const { Text } = Typography;

// Add interest level helper
const getInterestLevel = (level) => {
  const levels = {
    "high": {
      color: "#52c41a",
      bg: "rgba(82, 196, 26, 0.1)",
      border: "#b7eb8f",
      text: "High Interest"
    },
    "medium": {
      color: "#faad14",
      bg: "rgba(250, 173, 20, 0.1)",
      border: "#ffd591",
      text: "Medium Interest"
    },
    "low": {
      color: "#ff4d4f",
      bg: "rgba(255, 77, 79, 0.1)",
      border: "#ffa39e",
      text: "Low Interest"
    }
  };
  return levels[level] || levels.medium;
};

const DraggableCard = ({ deal, stage, onEdit, onDelete, onView, onDealClick, isOverlay }) => {
  const navigate = useNavigate();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: {
      type: 'card',
      deal,
      originalStageId: stage?.id
    }
  });

  // Fetch necessary data (Status, Source, Category, Labels)
  const clientId = deal?.client_id || useSelector(selectCurrentUser)?.client_id;
  const { data: statusesData } = useGetStatusesQuery(clientId, { skip: !clientId });
  const { data: labelsData } = useGetLabelsQuery(clientId, { skip: !clientId });
  const { data: sourceData } = useGetSourcesQuery(clientId, { skip: !clientId });
  const { data: categoryData } = useGetCategoriesQuery(clientId, { skip: !clientId });
  const { data: currencies } = useGetAllCurrenciesQuery();

  const status = statusesData?.data?.find(s => s.id === deal.status);
  const source = sourceData?.data?.find(s => s.id === deal.source);
  const category = categoryData?.data?.find(c => c.id === deal.category);
  const interestStyle = getInterestLevel(deal.interest_level);

  // Determine display status
  const dealDisplayStatus = deal.is_converted
    ? { text: 'Converted', color: '#15803d', bg: '#dcfce7' }
    : { text: 'Active', color: '#1e40af', bg: '#dbeafe' };

  // Dropdown menu items
  const getDropdownItems = (deal) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: (e) => { e.stopPropagation(); onDealClick?.(deal); },
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: (e) => { e.stopPropagation(); onEdit?.(deal); },
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: (e) => { e.stopPropagation(); onDelete?.(deal); },
        danger: true,
      },
    ],
  });

  const onDropdownClick = (e) => {
    e.stopPropagation();
  };

  // Assuming deal.labelIds is an array of label IDs
  const dealLabels = React.useMemo(() => {
    if (!labelsData?.data || !deal.labelIds) return [];
    return labelsData.data.filter(label => deal.labelIds.includes(label.id));
  }, [labelsData, deal.labelIds]);

  // Update the currency formatting helper in DraggableCard
  const formatDealValue = (value, currencyId) => {
    const currencyDetails = currencies?.find(c => c.id === currencyId);
    if (!currencyDetails) {
      return `₹${(parseFloat(value) || 0).toLocaleString('en-IN')}`;
    }
    return `${currencyDetails.currencyIcon}${(parseFloat(value) || 0).toLocaleString('en-IN')}`;
  };

  const handleCardClick = (e) => {
    if (isDragging) return;
    if (!isDragging && !isOverlay) {
      e.stopPropagation();
      navigate(`/dashboard/crm/deals/${deal.id}`);
    }
  };

  const cardContent = (
    <Card
      className="deal-card"
      bordered={false}
      onClick={handleCardClick}
      style={{
        borderRadius: '8px',
        background: deal.is_converted ? '#f8fafc' : '#ffffff',
        cursor: deal.is_converted ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
        boxShadow: isDragging
          ? '0 12px 24px rgba(0, 0, 0, 0.12)'
          : '0 1px 3px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        transition: isDragging ? 'none' : 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        zIndex: isDragging ? 1200 : 1,
        overflow: 'hidden',
        opacity: deal.is_converted ? 0.85 : 1
      }}
    >
      {/* Interest Level Top Indicator */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: '100%', height: '3px',
        background: interestStyle.color, opacity: 0.9
      }} />

      {/* Dropdown Button - Positioned absolutely */}
      <Dropdown menu={getDropdownItems(deal)} trigger={["click"]} placement="bottomRight">
        <Button
          type="text"
          icon={<FiMoreVertical />}
          style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, color: '#6b7280' }}
          onClick={onDropdownClick}
        />
      </Dropdown>

      {/* Card Content - Structure mirroring LeadCard */}
      <div style={{ padding: '12px 14px 12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top Row: Status & Interest */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '-4px', marginTop: '4px' }}>
          {/* Active/Converted Status */}
          <div style={{
            fontSize: '11px', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex',
            alignItems: 'center', gap: '4px', background: dealDisplayStatus.bg, color: dealDisplayStatus.color,
            fontWeight: '500', lineHeight: '14px'
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor' }} />
            {dealDisplayStatus.text}
          </div>
          {/* Interest Level Badge */}
          {deal.interest_level && (
            <div style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '4px', display: 'inline-flex',
              alignItems: 'center', gap: '4px', background: interestStyle.color, color: '#ffffff',
              fontWeight: '500', lineHeight: '14px', boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
            }}>
              {interestStyle.text}
            </div>
          )}
        </div>

        {/* Title, Company, Value Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tooltip title={deal?.dealTitle} placement="topLeft">
              <Text strong className="deal-title" style={{
                fontSize: '14px', lineHeight: '1.4', display: 'block', overflow: 'hidden',
                textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1f2937'
              }}>
                {deal?.dealTitle || 'Untitled Deal'}
              </Text>
            </Tooltip>
            {deal.company_name && (
              <Tooltip title={`Company: ${deal.company_name}`}>
                <Text className="company-name" style={{
                  fontSize: '12px', color: '#64748b', display: 'block', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px'
                }}>
                  {deal.company_name}
                </Text>
              </Tooltip>
            )}
            {/* Contact Name (Add if you have firstName/lastName on the deal object) */}
            <Text className="contact-name" style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '2px' }}>
              {`${deal.firstName || ''} ${deal.lastName || ''}`.trim() || 'No Contact'}
            </Text>
          </div>
          {/* Value Tag */}
          <div style={{
            display: 'flex', alignItems: 'center', background: '#f0fdf4', padding: '2px 8px',
            borderRadius: '4px', border: '1px solid #dcfce7', height: '20px'
          }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a', whiteSpace: 'nowrap' }}>
              {formatDealValue(deal.value, deal.currency)}
            </span>
          </div>
        </div>

        {/* Bottom Info Section (Tags) - Mirroring LeadCard */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: '8px', background: '#f8fafc',
          margin: '0 -14px -12px -16px', padding: '8px 16px', borderTop: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Status Tag (using deal.status) */}
            {status && (
              <Tooltip title={`Status: ${status.name}`}>
                <Tag icon={<FiFlag style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#f1f5f9',
                  color: '#475569', border: '1px solid #e2e8f0', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', cursor: 'default'
                }}>
                  {status.name}
                </Tag>
              </Tooltip>
            )}
            {/* Source Tag (using deal.source) */}
            {source && (
              <Tooltip title={`Source: ${source.name}`}>
                <Tag icon={<FiDatabase style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#eff6ff',
                  color: '#3b82f6', border: '1px solid #bfdbfe', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', cursor: 'default'
                }}>
                  {source.name}
                </Tag>
              </Tooltip>
            )}
            {/* Category Tag (using deal.category) */}
            {category && (
              <Tooltip title={`Category: ${category.name}`}>
                <Tag icon={<FiTag style={{ fontSize: '10px' }} />} style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px', background: '#ecfeff',
                  color: '#0891b2', border: '1px solid #bae6fd', lineHeight: '16px', display: 'inline-flex',
                  alignItems: 'center', gap: '4px', maxWidth: '120px', overflow: 'hidden',
                  textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default'
                }}>
                  {category.name}
                </Tag>
              </Tooltip>
            )}
            {/* Label Tags (using deal.labelIds) */}
            {dealLabels && dealLabels.map(label => (
              <Tooltip key={label.id} title={`Label: ${label.name}`}>
                <Tag style={{
                  margin: 0, padding: '2px 8px', fontSize: '11px', borderRadius: '4px',
                  backgroundColor: label.color + '1A', color: label.color, borderColor: label.color + '33',
                  lineHeight: '16px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                  cursor: 'default'
                }}>
                  {label.name}
                </Tag>
              </Tooltip>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );

  const draggableProps = deal.is_converted ? {} : { ...attributes, ...listeners };

  if (isDragging) {
    return createPortal(
      <div
        ref={setNodeRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 999999,
          width: '350px',
          transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
          opacity: 0.95,
          pointerEvents: 'none',
          cursor: 'grabbing',
          transformOrigin: '0 0',
          willChange: 'transform',
          transition: 'none'
        }}
        {...draggableProps}
      >
        {cardContent}
      </div>,
      document.body
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'relative',
        transform: 'translate3d(0, 0, 0)',
        touchAction: 'none',
        transformStyle: 'preserve-3d',
        backfaceVisibility: 'hidden'
      }}
      {...draggableProps}
    >
      {cardContent}
    </div>
  );
};

const DroppableStage = ({ stage, children, deals, onEdit, onDelete, onView, onDealClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className="kanban-column-content"
      style={{
        padding: '8px',
        height: 'calc(100vh - 240px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        backgroundColor: isOver ? 'rgba(240, 247, 255, 0.8)' : 'transparent',
        borderRadius: '0 0 8px 8px',
        width: '350px',
        position: 'relative',
        transition: 'background-color 0.2s ease',
        willChange: 'background-color'
      }}
    >
      <SortableContext items={deals.map(deal => deal.id)} strategy={verticalListSortingStrategy}>
        {deals.length > 0 ? (
          deals.map((deal) => (
            <DraggableCard
              key={deal.id}
              deal={deal}
              stage={stage}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              onDealClick={onDealClick}
            />
          ))
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No deals"
            style={{
              padding: '40px 0',
              opacity: 0.75
            }}
          />
        )}
      </SortableContext>
    </div>
  );
};

const SortableColumn = ({ stage, dealsInStage, children, index }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useSortable({
    id: `column-${stage.id}`,
    data: {
      type: 'column',
      stage
    }
  });

  const { data: currencies = [] } = useGetAllCurrenciesQuery();

  // Update the total value formatting helper
  const formatTotalValue = (deals) => {
    // Calculate total sum across all deals regardless of currency
    const totalSum = deals.reduce((sum, deal) => {
      return sum + (parseFloat(deal.value) || 0);
    }, 0);

    // Format the total with Indian number formatting
    return totalSum > 0 ? `₹${totalSum.toLocaleString('en-IN')}` : '₹0';
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
    width: '350px',
    minWidth: '350px',
    willChange: 'transform'
  };

  // Calculate total value and count
  const totalValue = formatTotalValue(dealsInStage);
  const dealsCount = dealsInStage.length;

  return (
    <div ref={setNodeRef} style={style} className={`kanban-column ${isDragging ? 'is-dragging' : ''}`}>
      <div className="kanban-column-inner" style={{
        background: '#ffffff',
        borderRadius: '8px',
        height: '100%',
        width: '100%',
        boxShadow: isDragging
          ? '0 8px 16px rgba(0, 0, 0, 0.08)'
          : '0 1px 3px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.2s ease',
        position: 'relative',
        zIndex: 1
      }}>
        <div
          className="column-header"
          {...attributes}
          {...listeners}
          style={{
            padding: '16px 12px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: isDragging ? 'grabbing' : 'grab',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
            background: '#ffffff',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            maxWidth: '60%'
          }}>
            <Tag color="blue" style={{
              fontSize: '10px',
              fontWeight: 'bold',
              padding: '0 3px',
              height: '16px',
              lineHeight: '16px',
              marginRight: '4px',
              flexShrink: 0,
              minWidth: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px'
            }}>
              {index + 1}
            </Tag>
            <FiMenu style={{
              fontSize: '14px',
              color: '#6B7280',
              flexShrink: 0,
              marginRight: '4px'
            }} />
            <Tooltip title={stage.stageName}>
              <Text strong style={{
                fontSize: '13px',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>{stage.stageName}</Text>
            </Tooltip>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}>
            {dealsInStage.length > 0 && totalValue !== '₹0' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: '#f0fdf4',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid #dcfce7'
              }}>
                <span style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#16a34a'
                }}>
                  {formatTotalValue(dealsInStage)}
                </span>
              </div>
            )}
            <Tag style={{
              minWidth: '20px',
              marginLeft: '4px',
              fontSize: '11px',
              padding: '0 4px',
              background: '#f3f4f6',
              color: '#4b5563',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {dealsInStage.length}
            </Tag>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

const DealCard = ({ onEdit, onDelete, onView, onDealClick }) => {
  const [updateDeal] = useUpdateDealMutation();
  const [updateLeadStage] = useUpdateLeadStageMutation();
  const { data: dealsData, isLoading: isLoadingDeals, error: dealsError } = useGetDealsQuery();
  const { data: stageQueryData, isLoading: isLoadingStages, refetch: refetchStages } = useGetLeadStagesQuery();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const savedStageOrder = useSelector(selectDealStageOrder);

  const [activeId, setActiveId] = useState(null);
  const [orderedStages, setOrderedStages] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState("cFaSfTBNfdMnnvSNxQmql0w");
  const [isStageModalVisible, setIsStageModalVisible] = useState(false);
  const [deals, setDeals] = useState([]);

  // Pipeline options
  const pipelines = [
    { id: "95QsEzSA7EGnxrlRqnDShFw", name: "Marketing" },
    { id: "cFaSfTBNfdMnnvSNxQmql0w", name: "Sales" }
  ];

  useEffect(() => {
    if (dealsData) {
      if (Array.isArray(dealsData)) {
        setDeals(dealsData);
      } else if (dealsData.data && Array.isArray(dealsData.data)) {
        setDeals(dealsData.data);
      } else {
        setDeals([]);
      }
    }
  }, [dealsData]);

  // Filter and order deal stages
  const stages = React.useMemo(() => {
    if (!stageQueryData) return [];
    const actualStages = Array.isArray(stageQueryData) ? stageQueryData : (stageQueryData.data || []);

    const dealStages = actualStages.filter(stage =>
      stage.stageType === 'deal' &&
      stage.pipeline === selectedPipeline
    );

    if (savedStageOrder.length > 0 && dealStages.length > 0) {
      const stageOrderMap = new Map(savedStageOrder.map((id, index) => [id, index]));
      return [...dealStages].sort((a, b) => {
        const indexA = stageOrderMap.has(a.id) ? stageOrderMap.get(a.id) : Infinity;
        const indexB = stageOrderMap.has(b.id) ? stageOrderMap.get(b.id) : Infinity;
        return indexA - indexB;
      });
    }

    return dealStages;
  }, [stageQueryData, savedStageOrder, selectedPipeline]);

  useEffect(() => {
    if (stages.length > 0) {
      setOrderedStages(stages);
      if (savedStageOrder.length === 0) {
        dispatch(setStageOrder(stages.map(stage => stage.id)));
      }
    } else {
      setOrderedStages([]);
    }
  }, [stages, dispatch, savedStageOrder.length]);

  const dealsByStage = React.useMemo(() => {
    return orderedStages.reduce((acc, stage) => {
      acc[stage.id] = deals.filter(deal => deal.stage === stage.id);
      return acc;
    }, {});
  }, [orderedStages, deals]);

  // Update the sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Increased distance for better distinction between click and drag
        delay: 0,
        tolerance: 5
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const isColumn = active.id.toString().startsWith('column-');
    const isCard = active.data?.current?.type === 'card';

    if (isColumn) {
      const oldIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === active.id
      );
      const newIndex = orderedStages.findIndex(
        stage => `column-${stage.id}` === over.id
      );

      if (oldIndex !== newIndex) {
        const newOrder = arrayMove(orderedStages, oldIndex, newIndex);
        setOrderedStages(newOrder);
        dispatch(setStageOrder(newOrder.map(stage => stage.id)));
      }
    } else if (isCard) {
      const draggedDeal = active.data.current.deal;
      const destinationStageId = over.id.toString().startsWith('column-')
        ? over.id.toString().replace('column-', '')
        : over.data.current.deal.stage;

      if (draggedDeal?.is_converted) {
        message.error("Cannot move a converted deal");
        return;
      }

      // Only update if moving to a different stage
      if (draggedDeal.stage !== destinationStageId) {
        try {
          // Optimistically update the UI
          setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === draggedDeal.id
                ? { ...deal, stage: destinationStageId }
                : deal
            )
          );

          // Make the API call
          await updateDeal({
            id: draggedDeal.id,
            data: {
              stage: destinationStageId,
              updated_by: currentUser?.username || ''
            }
          }).unwrap();

          const destinationStage = orderedStages.find(stage => stage.id === destinationStageId);
          message.success(`Deal moved to ${destinationStage?.stageName || 'new stage'}`);
        } catch (error) {
          // Revert the optimistic update on error
          setDeals(prevDeals =>
            prevDeals.map(deal =>
              deal.id === draggedDeal.id
                ? { ...deal, stage: draggedDeal.stage }
                : deal
            )
          );
          message.error('Failed to update deal stage');
        }
      }
    }
  };

  const showStageModal = () => {
    setIsStageModalVisible(true);
  };

  const handleStageModalClose = (didAddStage = false) => {
    setIsStageModalVisible(false);
    if (didAddStage) {
      refetchStages();
    }
  };

  if (isLoadingDeals || isLoadingStages) return <div>Loading...</div>;
  if (dealsError) return <div>Error loading data. Please try again.</div>;

  return (
    <div className="deal-kanban" style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Pipeline Filter */}
      <div style={{
        padding: '12px',
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        background: '#ffffff'
      }}>
        <Text strong style={{ fontSize: '13px', color: '#374151' }}>Pipeline:</Text>
        <div style={{
          display: 'flex',
          gap: '6px',
          flex: 1
        }}>
          {pipelines.map(pipeline => (
            <Button
              key={pipeline.id}
              type={selectedPipeline === pipeline.id ? "primary" : "default"}
              onClick={() => setSelectedPipeline(pipeline.id)}
              style={{
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 10px',
                height: '28px',
                fontSize: '12px'
              }}
            >
              <FiTarget style={{ fontSize: '12px' }} />
              {pipeline.name}
            </Button>
          ))}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="kanban-board-wrapper" style={{
          width: '100%',
          height: 'calc(100vh - 180px)',
          overflow: 'hidden',
          position: 'relative',
          isolation: 'isolate',
          perspective: 1000,
          transformStyle: 'preserve-3d'
        }}>
          <div className="kanban-board" style={{
            display: 'flex',
            gap: '16px',
            padding: '12px',
            width: 'max-content',
            minWidth: '100%',
            height: '100%',
            overflowX: 'auto',
            overflowY: 'hidden',
            position: 'relative',
            transformStyle: 'preserve-3d',
            perspective: 1000,
            alignItems: 'flex-start'
          }}>
            <SortableContext
              items={orderedStages.map(stage => `column-${stage.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {orderedStages.map((stage, index) => (
                <div key={stage.id} style={{ transform: 'translateZ(0)' }}>
                  <SortableColumn
                    stage={stage}
                    dealsInStage={dealsByStage[stage.id] || []}
                    index={index}
                  >
                    <DroppableStage
                      stage={stage}
                      deals={dealsByStage[stage.id] || []}
                      isColumnDragging={activeId === `column-${stage.id}`}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onView={onView}
                      onDealClick={onDealClick}
                    />
                  </SortableColumn>
                </div>
              ))}
            </SortableContext>

            {/* Add Stage Button */}
            <div style={{
              width: '350px',
              minWidth: '350px'
            }}>
              <Button
                type="dashed"
                onClick={showStageModal}
                style={{
                  width: '100%',
                  height: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#4b5563',
                  background: '#f9fafb',
                  border: '1px dashed #d1d5db',
                  borderRadius: '8px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)'
                }}
                disabled={isLoadingStages}
              >
                <FiPlus />
                Add Stage
              </Button>
            </div>
          </div>
        </div>
      </DndContext>

      {/* Stage Modal */}
      {isStageModalVisible && (
        <AddLeadStageModal
          isOpen={isStageModalVisible}
          onClose={handleStageModalClose}
          pipelineId={selectedPipeline}
        />
      )}

      <style jsx global>{`
        .kanban-board {
          -webkit-overflow-scrolling: touch;
        }

        .kanban-column-content {
          -webkit-overflow-scrolling: touch;
        }

        .deal-card {
          backface-visibility: hidden;
        }
        
        .kanban-column.is-dragging {
          cursor: grabbing !important;
        }
      `}</style>
    </div>
  );
};

export default DealCard;